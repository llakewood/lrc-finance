"""
Purchasing and Inventory Data Management
Handles purchases, suppliers, inventory levels, and price history tracking.
"""

import json
import hashlib
from dataclasses import dataclass, field
from datetime import datetime, date
from pathlib import Path
from typing import Optional

# =============================================================================
# FILE PATHS
# =============================================================================

DATA_DIR = Path(__file__).parent
PURCHASES_FILE = DATA_DIR / "purchases.json"
SUPPLIERS_FILE = DATA_DIR / "suppliers.json"
INVENTORY_FILE = DATA_DIR / "inventory.json"
PRICE_HISTORY_FILE = DATA_DIR / "price_history.json"


# =============================================================================
# ID GENERATION
# =============================================================================

def generate_id(seed: str) -> str:
    """Generate a 12-character ID from a seed string."""
    return hashlib.md5(seed.encode()).hexdigest()[:12]


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class Supplier:
    id: str
    name: str
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    account_number: Optional[str] = None
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    typical_lead_days: Optional[int] = None
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class Purchase:
    id: str
    ingredient_id: str
    date: str  # ISO date string YYYY-MM-DD
    quantity: float
    unit: str
    total_cost: float
    unit_price: float
    supplier_id: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None
    source: str = "manual"  # manual, ocr, import
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class Inventory:
    id: str
    ingredient_id: str
    current_quantity: float
    unit: str
    min_stock_level: Optional[float] = None
    max_stock_level: Optional[float] = None
    last_updated: str = field(default_factory=lambda: datetime.now().isoformat())
    last_purchase_id: Optional[str] = None


@dataclass
class PriceHistory:
    id: str
    ingredient_id: str
    date: str  # ISO date string YYYY-MM-DD
    unit_price: float
    previous_price: Optional[float] = None
    change_percent: Optional[float] = None
    purchase_id: Optional[str] = None
    supplier_id: Optional[str] = None


# =============================================================================
# IN-MEMORY CACHE
# =============================================================================

_suppliers: list[Supplier] = []
_suppliers_by_id: dict[str, Supplier] = {}
_purchases: list[Purchase] = []
_purchases_by_id: dict[str, Purchase] = {}
_inventory: list[Inventory] = []
_inventory_by_ingredient: dict[str, Inventory] = {}
_price_history: list[PriceHistory] = []
_loaded = False


# =============================================================================
# LOADING FUNCTIONS
# =============================================================================

def _ensure_loaded():
    """Ensure all data is loaded into memory."""
    global _loaded
    if not _loaded:
        _load_all()
        _loaded = True


def _load_all():
    """Load all data from JSON files."""
    _load_suppliers()
    _load_purchases()
    _load_inventory()
    _load_price_history()


def _load_suppliers():
    """Load suppliers from JSON file."""
    global _suppliers, _suppliers_by_id
    _suppliers = []
    _suppliers_by_id = {}

    if not SUPPLIERS_FILE.exists():
        return

    try:
        with open(SUPPLIERS_FILE, "r") as f:
            data = json.load(f)

        for item in data:
            supplier = Supplier(
                id=item["id"],
                name=item["name"],
                contact_name=item.get("contact_name"),
                email=item.get("email"),
                phone=item.get("phone"),
                address=item.get("address"),
                website=item.get("website"),
                account_number=item.get("account_number"),
                payment_terms=item.get("payment_terms"),
                notes=item.get("notes"),
                typical_lead_days=item.get("typical_lead_days"),
                created_at=item.get("created_at", datetime.now().isoformat()),
            )
            _suppliers.append(supplier)
            _suppliers_by_id[supplier.id] = supplier
    except (json.JSONDecodeError, KeyError) as e:
        print(f"Error loading suppliers: {e}")


def _load_purchases():
    """Load purchases from JSON file."""
    global _purchases, _purchases_by_id
    _purchases = []
    _purchases_by_id = {}

    if not PURCHASES_FILE.exists():
        return

    try:
        with open(PURCHASES_FILE, "r") as f:
            data = json.load(f)

        for item in data:
            purchase = Purchase(
                id=item["id"],
                ingredient_id=item["ingredient_id"],
                date=item["date"],
                quantity=item["quantity"],
                unit=item["unit"],
                total_cost=item["total_cost"],
                unit_price=item["unit_price"],
                supplier_id=item.get("supplier_id"),
                invoice_number=item.get("invoice_number"),
                notes=item.get("notes"),
                source=item.get("source", "manual"),
                created_at=item.get("created_at", datetime.now().isoformat()),
            )
            _purchases.append(purchase)
            _purchases_by_id[purchase.id] = purchase
    except (json.JSONDecodeError, KeyError) as e:
        print(f"Error loading purchases: {e}")


def _load_inventory():
    """Load inventory from JSON file."""
    global _inventory, _inventory_by_ingredient
    _inventory = []
    _inventory_by_ingredient = {}

    if not INVENTORY_FILE.exists():
        return

    try:
        with open(INVENTORY_FILE, "r") as f:
            data = json.load(f)

        for item in data:
            inv = Inventory(
                id=item["id"],
                ingredient_id=item["ingredient_id"],
                current_quantity=item["current_quantity"],
                unit=item["unit"],
                min_stock_level=item.get("min_stock_level"),
                max_stock_level=item.get("max_stock_level"),
                last_updated=item.get("last_updated", datetime.now().isoformat()),
                last_purchase_id=item.get("last_purchase_id"),
            )
            _inventory.append(inv)
            _inventory_by_ingredient[inv.ingredient_id] = inv
    except (json.JSONDecodeError, KeyError) as e:
        print(f"Error loading inventory: {e}")


def _load_price_history():
    """Load price history from JSON file."""
    global _price_history
    _price_history = []

    if not PRICE_HISTORY_FILE.exists():
        return

    try:
        with open(PRICE_HISTORY_FILE, "r") as f:
            data = json.load(f)

        for item in data:
            ph = PriceHistory(
                id=item["id"],
                ingredient_id=item["ingredient_id"],
                date=item["date"],
                unit_price=item["unit_price"],
                previous_price=item.get("previous_price"),
                change_percent=item.get("change_percent"),
                purchase_id=item.get("purchase_id"),
                supplier_id=item.get("supplier_id"),
            )
            _price_history.append(ph)
    except (json.JSONDecodeError, KeyError) as e:
        print(f"Error loading price history: {e}")


# =============================================================================
# SAVING FUNCTIONS
# =============================================================================

def _save_suppliers():
    """Save suppliers to JSON file."""
    data = []
    for s in _suppliers:
        data.append({
            "id": s.id,
            "name": s.name,
            "contact_name": s.contact_name,
            "email": s.email,
            "phone": s.phone,
            "address": s.address,
            "website": s.website,
            "account_number": s.account_number,
            "payment_terms": s.payment_terms,
            "notes": s.notes,
            "typical_lead_days": s.typical_lead_days,
            "created_at": s.created_at,
        })

    with open(SUPPLIERS_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _save_purchases():
    """Save purchases to JSON file."""
    data = []
    for p in _purchases:
        data.append({
            "id": p.id,
            "ingredient_id": p.ingredient_id,
            "date": p.date,
            "quantity": p.quantity,
            "unit": p.unit,
            "total_cost": p.total_cost,
            "unit_price": p.unit_price,
            "supplier_id": p.supplier_id,
            "invoice_number": p.invoice_number,
            "notes": p.notes,
            "source": p.source,
            "created_at": p.created_at,
        })

    with open(PURCHASES_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _save_inventory():
    """Save inventory to JSON file."""
    data = []
    for inv in _inventory:
        data.append({
            "id": inv.id,
            "ingredient_id": inv.ingredient_id,
            "current_quantity": inv.current_quantity,
            "unit": inv.unit,
            "min_stock_level": inv.min_stock_level,
            "max_stock_level": inv.max_stock_level,
            "last_updated": inv.last_updated,
            "last_purchase_id": inv.last_purchase_id,
        })

    with open(INVENTORY_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _save_price_history():
    """Save price history to JSON file."""
    data = []
    for ph in _price_history:
        data.append({
            "id": ph.id,
            "ingredient_id": ph.ingredient_id,
            "date": ph.date,
            "unit_price": ph.unit_price,
            "previous_price": ph.previous_price,
            "change_percent": ph.change_percent,
            "purchase_id": ph.purchase_id,
            "supplier_id": ph.supplier_id,
        })

    with open(PRICE_HISTORY_FILE, "w") as f:
        json.dump(data, f, indent=2)


# =============================================================================
# SUPPLIER CRUD
# =============================================================================

def get_suppliers() -> list[dict]:
    """Get all suppliers."""
    _ensure_loaded()
    return [supplier_to_dict(s) for s in _suppliers]


def get_supplier_by_id(supplier_id: str) -> Optional[dict]:
    """Get a supplier by ID."""
    _ensure_loaded()
    supplier = _suppliers_by_id.get(supplier_id)
    return supplier_to_dict(supplier) if supplier else None


def create_supplier(data: dict) -> Supplier:
    """Create a new supplier."""
    _ensure_loaded()

    supplier_id = generate_id(f"supplier:{data['name']}:{datetime.now().isoformat()}")

    supplier = Supplier(
        id=supplier_id,
        name=data["name"],
        contact_name=data.get("contact_name"),
        email=data.get("email"),
        phone=data.get("phone"),
        address=data.get("address"),
        website=data.get("website"),
        account_number=data.get("account_number"),
        payment_terms=data.get("payment_terms"),
        notes=data.get("notes"),
        typical_lead_days=data.get("typical_lead_days"),
    )

    _suppliers.append(supplier)
    _suppliers_by_id[supplier.id] = supplier
    _save_suppliers()

    return supplier


def update_supplier(supplier_id: str, data: dict) -> Optional[Supplier]:
    """Update a supplier."""
    _ensure_loaded()

    supplier = _suppliers_by_id.get(supplier_id)
    if not supplier:
        return None

    editable_fields = {
        "name", "contact_name", "email", "phone", "address", "website",
        "account_number", "payment_terms", "notes", "typical_lead_days"
    }

    for field_name, value in data.items():
        if field_name in editable_fields:
            setattr(supplier, field_name, value)

    _save_suppliers()
    return supplier


def delete_supplier(supplier_id: str) -> bool:
    """Delete a supplier."""
    _ensure_loaded()

    supplier = _suppliers_by_id.get(supplier_id)
    if not supplier:
        return False

    _suppliers.remove(supplier)
    del _suppliers_by_id[supplier_id]
    _save_suppliers()

    return True


# =============================================================================
# PURCHASE CRUD
# =============================================================================

def get_purchases(
    ingredient_id: Optional[str] = None,
    supplier_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    limit: int = 100
) -> list[dict]:
    """Get purchases with optional filters."""
    _ensure_loaded()

    result = []
    for p in sorted(_purchases, key=lambda x: x.date, reverse=True):
        if ingredient_id and p.ingredient_id != ingredient_id:
            continue
        if supplier_id and p.supplier_id != supplier_id:
            continue
        if date_from and p.date < date_from:
            continue
        if date_to and p.date > date_to:
            continue

        result.append(purchase_to_dict(p))
        if len(result) >= limit:
            break

    return result


def get_purchase_by_id(purchase_id: str) -> Optional[dict]:
    """Get a purchase by ID."""
    _ensure_loaded()
    purchase = _purchases_by_id.get(purchase_id)
    return purchase_to_dict(purchase) if purchase else None


def create_purchase(data: dict) -> Purchase:
    """Create a new purchase and track price history."""
    _ensure_loaded()

    purchase_id = generate_id(f"purchase:{data['ingredient_id']}:{datetime.now().isoformat()}")

    # Calculate unit_price if not provided
    unit_price = data.get("unit_price")
    if unit_price is None and data.get("quantity") and data.get("total_cost"):
        unit_price = data["total_cost"] / data["quantity"]

    purchase = Purchase(
        id=purchase_id,
        ingredient_id=data["ingredient_id"],
        date=data.get("date", date.today().isoformat()),
        quantity=data["quantity"],
        unit=data.get("unit", "units"),
        total_cost=data["total_cost"],
        unit_price=unit_price or 0,
        supplier_id=data.get("supplier_id"),
        invoice_number=data.get("invoice_number"),
        notes=data.get("notes"),
        source=data.get("source", "manual"),
    )

    _purchases.append(purchase)
    _purchases_by_id[purchase.id] = purchase
    _save_purchases()

    # Track price history
    _track_price_change(purchase)

    # Update inventory
    _update_inventory_from_purchase(purchase)

    return purchase


def update_purchase(purchase_id: str, data: dict) -> Optional[Purchase]:
    """Update a purchase."""
    _ensure_loaded()

    purchase = _purchases_by_id.get(purchase_id)
    if not purchase:
        return None

    editable_fields = {
        "date", "quantity", "unit", "total_cost", "unit_price",
        "supplier_id", "invoice_number", "notes"
    }

    for field_name, value in data.items():
        if field_name in editable_fields:
            setattr(purchase, field_name, value)

    # Recalculate unit_price if needed
    if purchase.quantity and purchase.total_cost:
        purchase.unit_price = purchase.total_cost / purchase.quantity

    _save_purchases()
    return purchase


def delete_purchase(purchase_id: str) -> bool:
    """Delete a purchase."""
    _ensure_loaded()

    purchase = _purchases_by_id.get(purchase_id)
    if not purchase:
        return False

    _purchases.remove(purchase)
    del _purchases_by_id[purchase_id]
    _save_purchases()

    return True


def create_batch_purchases(items: list[dict], common_data: dict) -> list[Purchase]:
    """
    Create multiple purchases from a single receipt.

    Args:
        items: List of purchase items, each containing:
            - ingredient_id: str
            - quantity: float
            - unit: str
            - total_cost: float
            - has_tax: bool (optional, for HST tracking)
            - notes: str (optional)
        common_data: Shared data for all purchases:
            - date: str (YYYY-MM-DD)
            - supplier_id: str (optional)
            - invoice_number: str (optional)

    Returns:
        List of created Purchase objects
    """
    _ensure_loaded()

    created_purchases = []

    for item in items:
        # Build purchase data combining item and common data
        purchase_data = {
            "ingredient_id": item["ingredient_id"],
            "quantity": item["quantity"],
            "unit": item.get("unit", "units"),
            "total_cost": item["total_cost"],
            "date": common_data.get("date", date.today().isoformat()),
            "supplier_id": common_data.get("supplier_id"),
            "invoice_number": common_data.get("invoice_number"),
            "source": "batch",
        }

        # Add notes including tax info if applicable
        notes_parts = []
        if item.get("notes"):
            notes_parts.append(item["notes"])
        if item.get("has_tax"):
            notes_parts.append("HST included")
        if notes_parts:
            purchase_data["notes"] = " | ".join(notes_parts)

        purchase = create_purchase(purchase_data)
        created_purchases.append(purchase)

    return created_purchases


# =============================================================================
# PRICE HISTORY
# =============================================================================

def _track_price_change(purchase: Purchase):
    """Track price changes for an ingredient."""
    # Find previous purchase for this ingredient
    prev_purchases = [
        p for p in _purchases
        if p.ingredient_id == purchase.ingredient_id
        and p.id != purchase.id
        and p.date <= purchase.date
    ]
    prev_purchases.sort(key=lambda x: x.date, reverse=True)

    previous_price = None
    change_percent = None

    if prev_purchases:
        prev = prev_purchases[0]
        previous_price = prev.unit_price
        if previous_price and previous_price > 0:
            change_percent = ((purchase.unit_price - previous_price) / previous_price) * 100

    # Only record if there's a price difference or it's the first purchase
    if previous_price is None or abs(purchase.unit_price - previous_price) > 0.001:
        ph = PriceHistory(
            id=generate_id(f"ph:{purchase.ingredient_id}:{purchase.date}:{datetime.now().isoformat()}"),
            ingredient_id=purchase.ingredient_id,
            date=purchase.date,
            unit_price=purchase.unit_price,
            previous_price=previous_price,
            change_percent=round(change_percent, 2) if change_percent else None,
            purchase_id=purchase.id,
            supplier_id=purchase.supplier_id,
        )
        _price_history.append(ph)
        _save_price_history()


def get_price_history(ingredient_id: str, days: int = 90) -> list[dict]:
    """Get price history for an ingredient."""
    _ensure_loaded()

    cutoff_date = (datetime.now() - __import__('datetime').timedelta(days=days)).date().isoformat()

    result = []
    for ph in _price_history:
        if ph.ingredient_id == ingredient_id and ph.date >= cutoff_date:
            result.append(price_history_to_dict(ph))

    result.sort(key=lambda x: x["date"])
    return result


def get_price_alerts(threshold_percent: float = 5.0) -> list[dict]:
    """Get ingredients with significant price increases."""
    _ensure_loaded()

    # Get most recent price history for each ingredient
    latest_by_ingredient: dict[str, PriceHistory] = {}
    for ph in sorted(_price_history, key=lambda x: x.date, reverse=True):
        if ph.ingredient_id not in latest_by_ingredient:
            latest_by_ingredient[ph.ingredient_id] = ph

    alerts = []
    for ingredient_id, ph in latest_by_ingredient.items():
        if ph.change_percent and ph.change_percent >= threshold_percent:
            alerts.append({
                "ingredient_id": ingredient_id,
                "current_price": ph.unit_price,
                "previous_price": ph.previous_price,
                "change_percent": ph.change_percent,
                "date": ph.date,
            })

    return sorted(alerts, key=lambda x: x["change_percent"], reverse=True)


# =============================================================================
# INVENTORY
# =============================================================================

def _update_inventory_from_purchase(purchase: Purchase):
    """Update inventory levels after a purchase."""
    inv = _inventory_by_ingredient.get(purchase.ingredient_id)

    if inv:
        inv.current_quantity += purchase.quantity
        inv.last_updated = datetime.now().isoformat()
        inv.last_purchase_id = purchase.id
    else:
        inv = Inventory(
            id=generate_id(f"inv:{purchase.ingredient_id}"),
            ingredient_id=purchase.ingredient_id,
            current_quantity=purchase.quantity,
            unit=purchase.unit,
            last_purchase_id=purchase.id,
        )
        _inventory.append(inv)
        _inventory_by_ingredient[purchase.ingredient_id] = inv

    _save_inventory()


def get_inventory() -> list[dict]:
    """Get all inventory levels."""
    _ensure_loaded()
    return [inventory_to_dict(inv) for inv in _inventory]


def get_inventory_by_ingredient(ingredient_id: str) -> Optional[dict]:
    """Get inventory for a specific ingredient."""
    _ensure_loaded()
    inv = _inventory_by_ingredient.get(ingredient_id)
    return inventory_to_dict(inv) if inv else None


def update_inventory(ingredient_id: str, data: dict) -> Optional[dict]:
    """Update inventory levels (manual adjustment)."""
    _ensure_loaded()

    inv = _inventory_by_ingredient.get(ingredient_id)
    if not inv:
        # Create new inventory record
        inv = Inventory(
            id=generate_id(f"inv:{ingredient_id}"),
            ingredient_id=ingredient_id,
            current_quantity=data.get("current_quantity", 0),
            unit=data.get("unit", "units"),
        )
        _inventory.append(inv)
        _inventory_by_ingredient[ingredient_id] = inv

    editable_fields = {
        "current_quantity", "unit", "min_stock_level", "max_stock_level"
    }

    for field_name, value in data.items():
        if field_name in editable_fields:
            setattr(inv, field_name, value)

    inv.last_updated = datetime.now().isoformat()
    _save_inventory()

    return inventory_to_dict(inv)


def get_low_stock_items() -> list[dict]:
    """Get inventory items below minimum stock level."""
    _ensure_loaded()

    low_stock = []
    for inv in _inventory:
        if inv.min_stock_level and inv.current_quantity < inv.min_stock_level:
            item = inventory_to_dict(inv)
            item["stock_status"] = "critical" if inv.current_quantity <= 0 else "low"
            low_stock.append(item)

    return sorted(low_stock, key=lambda x: x["current_quantity"])


# =============================================================================
# SERIALIZATION
# =============================================================================

def supplier_to_dict(supplier: Supplier) -> dict:
    """Convert Supplier to dictionary."""
    return {
        "id": supplier.id,
        "name": supplier.name,
        "contact_name": supplier.contact_name,
        "email": supplier.email,
        "phone": supplier.phone,
        "address": supplier.address,
        "website": supplier.website,
        "account_number": supplier.account_number,
        "payment_terms": supplier.payment_terms,
        "notes": supplier.notes,
        "typical_lead_days": supplier.typical_lead_days,
        "created_at": supplier.created_at,
    }


def purchase_to_dict(purchase: Purchase) -> dict:
    """Convert Purchase to dictionary."""
    _ensure_loaded()

    # Include supplier name if available
    supplier_name = None
    if purchase.supplier_id:
        supplier = _suppliers_by_id.get(purchase.supplier_id)
        if supplier:
            supplier_name = supplier.name

    return {
        "id": purchase.id,
        "ingredient_id": purchase.ingredient_id,
        "date": purchase.date,
        "quantity": purchase.quantity,
        "unit": purchase.unit,
        "total_cost": purchase.total_cost,
        "unit_price": round(purchase.unit_price, 4) if purchase.unit_price else None,
        "supplier_id": purchase.supplier_id,
        "supplier_name": supplier_name,
        "invoice_number": purchase.invoice_number,
        "notes": purchase.notes,
        "source": purchase.source,
        "created_at": purchase.created_at,
    }


def inventory_to_dict(inv: Inventory) -> dict:
    """Convert Inventory to dictionary."""
    # Determine stock status
    stock_status = "ok"
    if inv.min_stock_level:
        if inv.current_quantity <= 0:
            stock_status = "critical"
        elif inv.current_quantity < inv.min_stock_level:
            stock_status = "low"
    if inv.max_stock_level and inv.current_quantity > inv.max_stock_level:
        stock_status = "overstocked"

    return {
        "id": inv.id,
        "ingredient_id": inv.ingredient_id,
        "current_quantity": inv.current_quantity,
        "unit": inv.unit,
        "min_stock_level": inv.min_stock_level,
        "max_stock_level": inv.max_stock_level,
        "last_updated": inv.last_updated,
        "last_purchase_id": inv.last_purchase_id,
        "stock_status": stock_status,
    }


def price_history_to_dict(ph: PriceHistory) -> dict:
    """Convert PriceHistory to dictionary."""
    _ensure_loaded()

    supplier_name = None
    if ph.supplier_id:
        supplier = _suppliers_by_id.get(ph.supplier_id)
        if supplier:
            supplier_name = supplier.name

    return {
        "id": ph.id,
        "ingredient_id": ph.ingredient_id,
        "date": ph.date,
        "unit_price": ph.unit_price,
        "previous_price": ph.previous_price,
        "change_percent": ph.change_percent,
        "purchase_id": ph.purchase_id,
        "supplier_id": ph.supplier_id,
        "supplier_name": supplier_name,
    }


# =============================================================================
# RELOAD
# =============================================================================

def reload_data():
    """Force reload all data from disk."""
    global _loaded
    _loaded = False
    _ensure_loaded()


# =============================================================================
# ALIAS FUNCTIONS (for API compatibility)
# =============================================================================

def get_all_purchases() -> list[Purchase]:
    """Get all purchases."""
    _ensure_loaded()
    return list(_purchases)


def get_purchase(purchase_id: str) -> Optional[Purchase]:
    """Get a purchase by ID."""
    _ensure_loaded()
    return _purchases_by_id.get(purchase_id)


def get_purchases_by_ingredient(ingredient_id: str, days: int = 90) -> list[Purchase]:
    """Get purchases for a specific ingredient."""
    _ensure_loaded()
    from datetime import timedelta
    cutoff = (datetime.now() - timedelta(days=days)).date().isoformat()
    return [
        p for p in _purchases
        if p.ingredient_id == ingredient_id and p.date >= cutoff
    ]


def get_all_suppliers() -> list[Supplier]:
    """Get all suppliers."""
    _ensure_loaded()
    return list(_suppliers)


def get_supplier(supplier_id: str) -> Optional[Supplier]:
    """Get a supplier by ID."""
    _ensure_loaded()
    return _suppliers_by_id.get(supplier_id)


def get_all_inventory() -> list[Inventory]:
    """Get all inventory items."""
    _ensure_loaded()
    return list(_inventory)


def get_inventory_item(ingredient_id: str) -> Optional[Inventory]:
    """Get inventory for a specific ingredient."""
    _ensure_loaded()
    return _inventory_by_ingredient.get(ingredient_id)


def update_inventory_item(ingredient_id: str, data: dict) -> Optional[Inventory]:
    """Update inventory for an ingredient."""
    result = update_inventory(ingredient_id, data)
    if result:
        return _inventory_by_ingredient.get(ingredient_id)
    return None


def get_recent_price_changes(days: int = 30) -> list[PriceHistory]:
    """Get recent price changes."""
    _ensure_loaded()
    from datetime import timedelta
    cutoff = (datetime.now() - timedelta(days=days)).date().isoformat()
    return [
        ph for ph in _price_history
        if ph.date >= cutoff and ph.change_percent is not None
    ]
