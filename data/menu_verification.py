"""
Square Menu Verification Tool

Compares recipes in our system against Square catalog items to ensure:
1. All recipes are tracked in Square
2. Prices match between our costing system and Square POS

Uses fuzzy matching to find corresponding items since names may differ slightly.
"""

from dataclasses import dataclass
from difflib import SequenceMatcher
from typing import Optional
from data.recipes import get_recipes, Recipe


@dataclass
class SquareMenuItem:
    """Represents an item from Square catalog"""
    id: str
    name: str
    variation_id: str
    variation_name: str
    price: float  # In dollars (converted from cents)
    category_name: Optional[str] = None


@dataclass
class MenuMatch:
    """A matched pair between recipe and Square item"""
    recipe_id: str
    recipe_name: str
    recipe_price: float
    square_item_id: str
    square_item_name: str
    square_price: float
    match_confidence: float  # 0-1 fuzzy match score
    price_matches: bool
    price_difference: float  # recipe_price - square_price


@dataclass
class VerificationResult:
    """Complete verification results"""
    matched: list[MenuMatch]
    price_mismatches: list[MenuMatch]  # Subset of matched where prices differ
    unmatched_recipes: list[dict]  # Recipes with no Square match
    square_items_count: int
    recipes_count: int


def fuzzy_match_score(s1: str, s2: str) -> float:
    """
    Calculate fuzzy match score between two strings.
    Returns value between 0 and 1.
    """
    # Normalize strings for comparison
    s1_norm = s1.lower().strip()
    s2_norm = s2.lower().strip()

    # Exact match
    if s1_norm == s2_norm:
        return 1.0

    # Use SequenceMatcher for fuzzy matching
    return SequenceMatcher(None, s1_norm, s2_norm).ratio()


def find_best_match(recipe_name: str, square_items: list[SquareMenuItem], threshold: float = 0.6) -> Optional[tuple[SquareMenuItem, float]]:
    """
    Find the best matching Square item for a recipe name.

    Args:
        recipe_name: Name of the recipe to match
        square_items: List of Square menu items to search
        threshold: Minimum match score to consider (0-1)

    Returns:
        Tuple of (matched_item, confidence_score) or None if no match
    """
    best_match = None
    best_score = 0.0

    for item in square_items:
        score = fuzzy_match_score(recipe_name, item.name)

        # Also check variation name if it might be more specific
        if item.variation_name and item.variation_name.lower() != "regular":
            combined_name = f"{item.name} {item.variation_name}"
            combined_score = fuzzy_match_score(recipe_name, combined_name)
            score = max(score, combined_score)

        if score > best_score:
            best_score = score
            best_match = item

    if best_score >= threshold:
        return (best_match, best_score)

    return None


def parse_square_catalog(catalog: dict[str, dict]) -> list[SquareMenuItem]:
    """
    Parse Square catalog objects into simplified SquareMenuItem list.
    Uses the first/default variation for pricing.

    Args:
        catalog: Dictionary of catalog objects keyed by ID

    Returns:
        List of SquareMenuItem objects
    """
    items = []

    # Build category lookup
    categories = {}
    for obj_id, obj in catalog.items():
        if obj.get("type") == "CATEGORY":
            cat_data = obj.get("category_data", {}) or {}
            categories[obj_id] = cat_data.get("name", "Uncategorized")

    # Process items
    for obj_id, obj in catalog.items():
        if obj.get("type") != "ITEM":
            continue

        item_data = obj.get("item_data", {}) or {}
        item_name = item_data.get("name", "Unknown")

        # Get category name
        cat_id = item_data.get("category_id")
        category_name = categories.get(cat_id, "Uncategorized") if cat_id else None

        # Get variations - use the first one as the default
        variations = item_data.get("variations", []) or []
        if not variations:
            continue

        # Use first variation (default)
        first_var = variations[0]
        var_data = first_var.get("item_variation_data", {}) or {}
        var_id = first_var.get("id", "")
        var_name = var_data.get("name", "Regular")

        # Get price from variation (in cents, convert to dollars)
        price_money = var_data.get("price_money", {}) or {}
        price_cents = price_money.get("amount", 0)
        price_dollars = price_cents / 100.0

        items.append(SquareMenuItem(
            id=obj_id,
            name=item_name,
            variation_id=var_id,
            variation_name=var_name,
            price=price_dollars,
            category_name=category_name,
        ))

    return items


def verify_menu(catalog: dict[str, dict], match_threshold: float = 0.6, price_tolerance: float = 0.01) -> VerificationResult:
    """
    Verify recipes against Square catalog.

    Args:
        catalog: Square catalog dictionary from get_catalog_items()
        match_threshold: Minimum fuzzy match score (0-1) to consider a match
        price_tolerance: Maximum price difference to consider matching (in dollars)

    Returns:
        VerificationResult with all matches and discrepancies
    """
    recipes = get_recipes()
    square_items = parse_square_catalog(catalog)

    matched: list[MenuMatch] = []
    price_mismatches: list[MenuMatch] = []
    unmatched_recipes: list[dict] = []

    # Track which Square items have been matched to avoid duplicates
    matched_square_ids = set()

    for recipe in recipes:
        # Skip recipes without a sale price
        if not recipe.proposed_sale_price:
            unmatched_recipes.append({
                "id": recipe.id,
                "name": recipe.name,
                "category": recipe.category,
                "reason": "No sale price set",
            })
            continue

        # Find best matching Square item
        result = find_best_match(recipe.name, square_items, match_threshold)

        if result is None:
            unmatched_recipes.append({
                "id": recipe.id,
                "name": recipe.name,
                "category": recipe.category,
                "proposed_sale_price": recipe.proposed_sale_price,
                "reason": "No matching Square item found",
            })
            continue

        square_item, confidence = result
        matched_square_ids.add(square_item.id)

        # Compare prices
        price_diff = recipe.proposed_sale_price - square_item.price
        prices_match = abs(price_diff) <= price_tolerance

        match = MenuMatch(
            recipe_id=recipe.id,
            recipe_name=recipe.name,
            recipe_price=recipe.proposed_sale_price,
            square_item_id=square_item.id,
            square_item_name=square_item.name,
            square_price=square_item.price,
            match_confidence=round(confidence, 3),
            price_matches=prices_match,
            price_difference=round(price_diff, 2),
        )

        matched.append(match)

        if not prices_match:
            price_mismatches.append(match)

    return VerificationResult(
        matched=matched,
        price_mismatches=price_mismatches,
        unmatched_recipes=unmatched_recipes,
        square_items_count=len(square_items),
        recipes_count=len(recipes),
    )


def verification_result_to_dict(result: VerificationResult) -> dict:
    """Convert VerificationResult to dictionary for API response"""
    return {
        "summary": {
            "recipes_count": result.recipes_count,
            "square_items_count": result.square_items_count,
            "matched_count": len(result.matched),
            "price_mismatch_count": len(result.price_mismatches),
            "unmatched_count": len(result.unmatched_recipes),
        },
        "price_mismatches": [
            {
                "recipe_id": m.recipe_id,
                "recipe_name": m.recipe_name,
                "recipe_price": m.recipe_price,
                "square_item_id": m.square_item_id,
                "square_item_name": m.square_item_name,
                "square_price": m.square_price,
                "price_difference": m.price_difference,
                "match_confidence": m.match_confidence,
            }
            for m in result.price_mismatches
        ],
        "unmatched_recipes": result.unmatched_recipes,
        "all_matches": [
            {
                "recipe_id": m.recipe_id,
                "recipe_name": m.recipe_name,
                "recipe_price": m.recipe_price,
                "square_item_id": m.square_item_id,
                "square_item_name": m.square_item_name,
                "square_price": m.square_price,
                "price_difference": m.price_difference,
                "price_matches": m.price_matches,
                "match_confidence": m.match_confidence,
            }
            for m in result.matched
        ],
    }
