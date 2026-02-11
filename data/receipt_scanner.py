"""
Receipt Scanner using Claude Vision API
Extracts structured purchase data from receipt images.
"""

import base64
import json
import os
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Optional

# Try to import anthropic, but don't fail if not installed
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


@dataclass
class ScannedItem:
    """A single item extracted from a receipt"""
    name: str
    quantity: float
    unit: str
    total_cost: float
    has_tax: bool = False
    confidence: float = 1.0


@dataclass
class ScannedReceipt:
    """Structured data extracted from a receipt image"""
    supplier_name: Optional[str]
    date: Optional[str]  # YYYY-MM-DD format
    items: list[ScannedItem]
    subtotal: Optional[float]
    tax_total: Optional[float]
    total: Optional[float]
    invoice_number: Optional[str]
    raw_text: Optional[str]  # For debugging
    confidence: float  # Overall confidence score


# Directory for storing receipt images (optional)
RECEIPTS_DIR = Path(__file__).parent / "receipts"


def ensure_receipts_dir():
    """Create receipts directory if it doesn't exist"""
    RECEIPTS_DIR.mkdir(parents=True, exist_ok=True)


def get_anthropic_client():
    """Get Anthropic client, checking for API key"""
    if not ANTHROPIC_AVAILABLE:
        raise RuntimeError("anthropic package not installed. Run: pip install anthropic")

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not set in environment")

    return anthropic.Anthropic(api_key=api_key)


def encode_image_to_base64(image_path: str) -> tuple[str, str]:
    """Read image file and encode to base64, return (base64_data, media_type)"""
    path = Path(image_path)

    # Determine media type from extension
    ext = path.suffix.lower()
    media_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
    }

    media_type = media_types.get(ext)
    if not media_type:
        raise ValueError(f"Unsupported image format: {ext}")

    with open(path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode("utf-8")

    return image_data, media_type


def encode_image_bytes_to_base64(image_bytes: bytes, media_type: str) -> str:
    """Encode raw image bytes to base64"""
    return base64.standard_b64encode(image_bytes).decode("utf-8")


EXTRACTION_PROMPT = """Analyze this receipt image and extract the purchase information in a structured JSON format.

Extract:
1. Store/supplier name
2. Date of purchase (format as YYYY-MM-DD)
3. Invoice or receipt number (if visible)
4. Each line item with:
   - Item name/description
   - Quantity (default to 1 if not specified)
   - Unit (e.g., "each", "lb", "kg", "oz" - use "each" if not specified)
   - Total cost for that item
   - Whether tax (HST/GST/PST) was charged on that item (look for tax indicators like * or T next to items)
5. Subtotal (before tax)
6. Tax total
7. Grand total

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "supplier_name": "Store Name or null",
  "date": "YYYY-MM-DD or null",
  "invoice_number": "number or null",
  "items": [
    {
      "name": "Item description",
      "quantity": 1.0,
      "unit": "each",
      "total_cost": 10.99,
      "has_tax": false
    }
  ],
  "subtotal": 10.99,
  "tax_total": 1.43,
  "total": 12.42,
  "confidence": 0.9
}

Notes:
- For quantity, parse numbers like "2x" or "x2" as quantity 2
- If prices include tax already (common in some stores), set has_tax to true for those items
- Confidence should be 0.0-1.0 based on how clear/readable the receipt is
- If you can't read something clearly, make your best guess but lower the confidence
- Common Canadian grocery stores: Costco, Loblaws, Metro, Sobeys, No Frills, Food Basics, Walmart
- Look for HST (13% in Ontario), or GST/PST in other provinces"""


def scan_receipt_from_file(image_path: str) -> ScannedReceipt:
    """
    Scan a receipt image file and extract structured data.

    Args:
        image_path: Path to the receipt image file

    Returns:
        ScannedReceipt with extracted data
    """
    image_data, media_type = encode_image_to_base64(image_path)
    return _scan_receipt(image_data, media_type)


def scan_receipt_from_bytes(image_bytes: bytes, media_type: str) -> ScannedReceipt:
    """
    Scan receipt from raw image bytes.

    Args:
        image_bytes: Raw image data
        media_type: MIME type (e.g., "image/jpeg")

    Returns:
        ScannedReceipt with extracted data
    """
    image_data = encode_image_bytes_to_base64(image_bytes, media_type)
    return _scan_receipt(image_data, media_type)


def _scan_receipt(image_base64: str, media_type: str) -> ScannedReceipt:
    """Internal function to scan receipt using Claude Vision API"""
    client = get_anthropic_client()

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_base64,
                        },
                    },
                    {
                        "type": "text",
                        "text": EXTRACTION_PROMPT,
                    },
                ],
            }
        ],
    )

    # Parse the response
    response_text = message.content[0].text.strip()

    # Try to extract JSON from the response
    try:
        # Handle case where response might have markdown code blocks
        if response_text.startswith("```"):
            # Extract JSON from code block
            lines = response_text.split("\n")
            json_lines = []
            in_block = False
            for line in lines:
                if line.startswith("```") and not in_block:
                    in_block = True
                    continue
                elif line.startswith("```") and in_block:
                    break
                elif in_block:
                    json_lines.append(line)
            response_text = "\n".join(json_lines)

        data = json.loads(response_text)
    except json.JSONDecodeError as e:
        # Return a low-confidence result if parsing fails
        return ScannedReceipt(
            supplier_name=None,
            date=None,
            items=[],
            subtotal=None,
            tax_total=None,
            total=None,
            invoice_number=None,
            raw_text=response_text,
            confidence=0.0,
        )

    # Convert to ScannedReceipt
    items = []
    for item_data in data.get("items", []):
        items.append(ScannedItem(
            name=item_data.get("name", "Unknown"),
            quantity=float(item_data.get("quantity", 1)),
            unit=item_data.get("unit", "each"),
            total_cost=float(item_data.get("total_cost", 0)),
            has_tax=bool(item_data.get("has_tax", False)),
            confidence=float(item_data.get("confidence", 1.0)),
        ))

    return ScannedReceipt(
        supplier_name=data.get("supplier_name"),
        date=data.get("date"),
        items=items,
        subtotal=data.get("subtotal"),
        tax_total=data.get("tax_total"),
        total=data.get("total"),
        invoice_number=data.get("invoice_number"),
        raw_text=None,  # Don't store raw text on success
        confidence=float(data.get("confidence", 0.8)),
    )


def save_receipt_image(image_bytes: bytes, filename: str) -> Path:
    """
    Save a receipt image to the receipts directory.

    Args:
        image_bytes: Raw image data
        filename: Filename to save as

    Returns:
        Path to saved file
    """
    ensure_receipts_dir()
    filepath = RECEIPTS_DIR / filename
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    return filepath


def scanned_receipt_to_dict(receipt: ScannedReceipt) -> dict:
    """Convert ScannedReceipt to dictionary for API response"""
    return {
        "supplier_name": receipt.supplier_name,
        "date": receipt.date,
        "invoice_number": receipt.invoice_number,
        "items": [
            {
                "name": item.name,
                "quantity": item.quantity,
                "unit": item.unit,
                "total_cost": item.total_cost,
                "has_tax": item.has_tax,
                "confidence": item.confidence,
            }
            for item in receipt.items
        ],
        "subtotal": receipt.subtotal,
        "tax_total": receipt.tax_total,
        "total": receipt.total,
        "confidence": receipt.confidence,
    }
