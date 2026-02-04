"""
Little Red Coffee - Recipe Costing Data
JSON-based storage with ingredient linking.
Supports editing, persistence, and auto-recalculation of recipe costs.
"""

from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional
import json
import hashlib

DATA_DIR = Path(__file__).parent
INGREDIENTS_FILE = DATA_DIR / "ingredients.json"
RECIPES_FILE = DATA_DIR / "recipes.json"


def generate_ingredient_id(name: str, category: str) -> str:
    """Generate a stable ID for an ingredient based on name and category"""
    key = f"{category}:{name}".lower()
    return hashlib.md5(key.encode()).hexdigest()[:12]


def generate_recipe_id(name: str) -> str:
    """Generate a stable ID for a recipe based on name"""
    key = f"recipe:{name}".lower()
    return hashlib.md5(key.encode()).hexdigest()[:12]


@dataclass
class Ingredient:
    """Master ingredient"""
    name: str
    category: str
    id: str = ""
    cost: Optional[float] = None  # Total cost (e.g., $55 for 5lb bag)
    units: Optional[float] = None  # Units per package (e.g., 100 cups)
    cost_per_unit: Optional[float] = None  # Calculated cost per single unit
    unit_sale: Optional[float] = None  # Retail price per unit
    unit_profit: Optional[float] = None
    case_profit: Optional[float] = None
    supplier: Optional[str] = None
    notes: Optional[str] = None

    def __post_init__(self):
        if not self.id:
            self.id = generate_ingredient_id(self.name, self.category)

    def recalculate(self):
        """Recalculate derived values"""
        if self.cost is not None and self.units is not None and self.units > 0:
            self.cost_per_unit = self.cost / self.units
        else:
            self.cost_per_unit = None

        if self.unit_sale is not None and self.cost_per_unit is not None:
            self.unit_profit = self.unit_sale - self.cost_per_unit
        else:
            self.unit_profit = None


@dataclass
class RecipeIngredient:
    """An ingredient used in a recipe, linked to master ingredient"""
    name: str
    ingredient_id: Optional[str] = None  # Link to master ingredient
    quantity: Optional[float] = None
    unit_cost: Optional[float] = None  # Cost per unit at time of recipe (or from linked ingredient)
    total_cost: Optional[float] = None
    match_confidence: Optional[float] = None
    match_reason: Optional[str] = None


@dataclass
class Recipe:
    """A recipe with costing information"""
    name: str
    id: str = ""
    concept: Optional[str] = None
    submitted_by: Optional[str] = None
    portions: int = 1
    prep_time_minutes: Optional[float] = None
    proposed_sale_price: Optional[float] = None
    margin_factor: float = 1.66  # 66% margin target

    # Labor cost
    cost_in_wages: Optional[float] = None

    # Calculated costs (auto-updated)
    cost_per_portion: Optional[float] = None
    cost_per_recipe: Optional[float] = None  # Total batch ingredient cost
    time_and_cogs: Optional[float] = None
    min_sale_price: Optional[float] = None
    profit_per_sale: Optional[float] = None

    # Ingredients
    ingredients: list[RecipeIngredient] = field(default_factory=list)

    def __post_init__(self):
        if not self.id:
            self.id = generate_recipe_id(self.name)

    def recalculate_costs(self, master_ingredients: dict[str, 'Ingredient'] = None):
        """
        Recalculate all derived costs.
        If master_ingredients provided, update unit costs from linked ingredients.
        """
        # Update unit costs from linked master ingredients
        if master_ingredients:
            for ing in self.ingredients:
                if ing.ingredient_id and ing.ingredient_id in master_ingredients:
                    master = master_ingredients[ing.ingredient_id]
                    if master.cost_per_unit is not None:
                        ing.unit_cost = master.cost_per_unit
                        if ing.quantity is not None:
                            ing.total_cost = ing.quantity * ing.unit_cost

        # Calculate total recipe cost (sum of ingredients)
        total_cost = 0.0
        for ing in self.ingredients:
            if ing.total_cost is not None:
                total_cost += ing.total_cost
        self.cost_per_recipe = total_cost if total_cost > 0 else None

        # Calculate cost per portion
        if self.cost_per_recipe and self.portions:
            self.cost_per_portion = self.cost_per_recipe / self.portions
        else:
            self.cost_per_portion = None

        # Calculate time and COGS (labor + ingredients)
        if self.cost_per_recipe is not None:
            labor = self.cost_in_wages or 0
            self.time_and_cogs = labor + self.cost_per_recipe

        # Calculate min sale price based on margin factor
        if self.time_and_cogs and self.margin_factor and self.portions:
            self.min_sale_price = (self.time_and_cogs / self.portions) * self.margin_factor

        # Calculate profit per sale
        if self.proposed_sale_price and self.cost_per_portion is not None:
            labor_per_portion = (self.cost_in_wages or 0) / self.portions if self.portions else 0
            self.profit_per_sale = self.proposed_sale_price - self.cost_per_portion - labor_per_portion


# =============================================================================
# DATA LOADING AND CACHING
# =============================================================================

_ingredients: list[Ingredient] = []
_ingredients_by_id: dict[str, Ingredient] = {}
_recipes: list[Recipe] = []
_loaded = False


def _load_ingredients_from_json() -> list[Ingredient]:
    """Load ingredients from JSON file"""
    if not INGREDIENTS_FILE.exists():
        return []

    with open(INGREDIENTS_FILE, 'r') as f:
        data = json.load(f)

    ingredients = []
    for item in data:
        ing = Ingredient(
            id=item.get('id', ''),
            name=item.get('name', ''),
            category=item.get('category', 'Uncategorized'),
            cost=item.get('cost'),
            units=item.get('units'),
            cost_per_unit=item.get('cost_per_unit'),
            unit_sale=item.get('unit_sale'),
            unit_profit=item.get('unit_profit'),
            case_profit=item.get('case_profit'),
            supplier=item.get('supplier'),
            notes=item.get('notes'),
        )
        ing.recalculate()
        ingredients.append(ing)

    return ingredients


def _load_recipes_from_json() -> list[Recipe]:
    """Load recipes from JSON file"""
    if not RECIPES_FILE.exists():
        return []

    with open(RECIPES_FILE, 'r') as f:
        data = json.load(f)

    recipes = []
    for item in data:
        # Parse ingredients
        ingredients = []
        for ing_data in item.get('ingredients', []):
            ing = RecipeIngredient(
                name=ing_data.get('name', ''),
                ingredient_id=ing_data.get('ingredient_id'),
                quantity=ing_data.get('quantity'),
                unit_cost=ing_data.get('unit_cost'),
                total_cost=ing_data.get('total_cost'),
                match_confidence=ing_data.get('match_confidence'),
                match_reason=ing_data.get('match_reason'),
            )
            ingredients.append(ing)

        recipe = Recipe(
            id=item.get('id', ''),
            name=item.get('name', ''),
            concept=item.get('concept'),
            submitted_by=item.get('submitted_by'),
            portions=item.get('portions', 1),
            prep_time_minutes=item.get('prep_time_minutes'),
            proposed_sale_price=item.get('proposed_sale_price'),
            margin_factor=item.get('margin_factor', 1.66),
            cost_in_wages=item.get('cost_in_wages'),
            cost_per_portion=item.get('cost_per_portion'),
            cost_per_recipe=item.get('cost_per_recipe'),
            time_and_cogs=item.get('time_and_cogs'),
            min_sale_price=item.get('min_sale_price'),
            profit_per_sale=item.get('profit_per_sale'),
            ingredients=ingredients,
        )
        recipes.append(recipe)

    return recipes


def _save_ingredients():
    """Save ingredients to JSON file"""
    data = []
    for ing in _ingredients:
        data.append({
            'id': ing.id,
            'name': ing.name,
            'category': ing.category,
            'cost': ing.cost,
            'units': ing.units,
            'cost_per_unit': round(ing.cost_per_unit, 4) if ing.cost_per_unit else None,
            'unit_sale': ing.unit_sale,
            'unit_profit': round(ing.unit_profit, 2) if ing.unit_profit else None,
            'case_profit': ing.case_profit,
            'supplier': ing.supplier,
            'notes': ing.notes,
        })

    with open(INGREDIENTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def _save_recipes():
    """Save recipes to JSON file"""
    data = []
    for recipe in _recipes:
        recipe_data = {
            'id': recipe.id,
            'name': recipe.name,
            'concept': recipe.concept,
            'submitted_by': recipe.submitted_by,
            'portions': recipe.portions,
            'prep_time_minutes': recipe.prep_time_minutes,
            'proposed_sale_price': recipe.proposed_sale_price,
            'margin_factor': recipe.margin_factor,
            'cost_in_wages': round(recipe.cost_in_wages, 2) if recipe.cost_in_wages else None,
            'ingredients': [],
        }

        for ing in recipe.ingredients:
            recipe_data['ingredients'].append({
                'name': ing.name,
                'ingredient_id': ing.ingredient_id,
                'quantity': ing.quantity,
                'unit_cost': round(ing.unit_cost, 4) if ing.unit_cost else None,
                'total_cost': round(ing.total_cost, 2) if ing.total_cost else None,
                'match_confidence': ing.match_confidence,
                'match_reason': ing.match_reason,
            })

        data.append(recipe_data)

    with open(RECIPES_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def _ensure_loaded():
    """Ensure data is loaded"""
    global _ingredients, _ingredients_by_id, _recipes, _loaded
    if not _loaded:
        _ingredients = _load_ingredients_from_json()
        _ingredients_by_id = {ing.id: ing for ing in _ingredients}
        _recipes = _load_recipes_from_json()

        # Recalculate all recipe costs with current ingredient prices
        for recipe in _recipes:
            recipe.recalculate_costs(_ingredients_by_id)

        _loaded = True


def get_ingredients() -> list[Ingredient]:
    """Get all master ingredients (cached)"""
    _ensure_loaded()
    return _ingredients


def get_recipes() -> list[Recipe]:
    """Get all recipes (cached)"""
    _ensure_loaded()
    return _recipes


def reload_data():
    """Force reload data from JSON files"""
    global _ingredients, _ingredients_by_id, _recipes, _loaded
    _ingredients = _load_ingredients_from_json()
    _ingredients_by_id = {ing.id: ing for ing in _ingredients}
    _recipes = _load_recipes_from_json()

    for recipe in _recipes:
        recipe.recalculate_costs(_ingredients_by_id)

    _loaded = True
    return len(_ingredients), len(_recipes)


# =============================================================================
# INGREDIENT OPERATIONS
# =============================================================================


def get_ingredient_by_id(ingredient_id: str) -> Optional[Ingredient]:
    """Get a single ingredient by ID"""
    _ensure_loaded()
    return _ingredients_by_id.get(ingredient_id)


def update_ingredient(ingredient_id: str, updates: dict) -> Optional[dict]:
    """
    Update an ingredient's fields and persist changes.
    Also recalculates all recipes using this ingredient.
    """
    _ensure_loaded()

    ing = _ingredients_by_id.get(ingredient_id)
    if not ing:
        return None

    # Allowed fields to edit
    editable_fields = {"name", "category", "cost", "units", "unit_sale", "supplier", "notes"}

    # Apply updates
    for field_name, value in updates.items():
        if field_name in editable_fields:
            # Convert empty strings to None for numeric fields
            if field_name in {"cost", "units", "unit_sale"} and value == "":
                value = None
            elif field_name in {"cost", "units", "unit_sale"} and value is not None:
                try:
                    value = float(value)
                except (ValueError, TypeError):
                    continue

            setattr(ing, field_name, value)

    # Recalculate derived values
    ing.recalculate()

    # Recalculate all recipes that use this ingredient
    _recalculate_affected_recipes(ingredient_id)

    # Save to JSON
    _save_ingredients()

    return ingredient_to_dict(ing)


def add_ingredient(data: dict) -> dict:
    """Add a new ingredient"""
    _ensure_loaded()

    ing = Ingredient(
        name=data.get("name", "New Ingredient"),
        category=data.get("category", "Uncategorized"),
        cost=data.get("cost"),
        units=data.get("units"),
        unit_sale=data.get("unit_sale"),
        supplier=data.get("supplier"),
        notes=data.get("notes"),
    )
    ing.recalculate()

    _ingredients.append(ing)
    _ingredients_by_id[ing.id] = ing
    _save_ingredients()

    return ingredient_to_dict(ing)


def delete_ingredient(ingredient_id: str) -> bool:
    """Delete an ingredient"""
    _ensure_loaded()

    for i, ing in enumerate(_ingredients):
        if ing.id == ingredient_id:
            _ingredients.pop(i)
            del _ingredients_by_id[ingredient_id]
            _save_ingredients()
            return True

    return False


def _recalculate_affected_recipes(ingredient_id: str):
    """Recalculate costs for all recipes using a specific ingredient"""
    for recipe in _recipes:
        uses_ingredient = any(
            ing.ingredient_id == ingredient_id
            for ing in recipe.ingredients
        )
        if uses_ingredient:
            recipe.recalculate_costs(_ingredients_by_id)

    # Save updated recipes
    _save_recipes()


# =============================================================================
# RECIPE OPERATIONS
# =============================================================================


def get_recipe_by_id(recipe_id: str) -> Optional[Recipe]:
    """Get a single recipe by ID"""
    _ensure_loaded()
    for recipe in _recipes:
        if recipe.id == recipe_id:
            return recipe
    return None


def update_recipe(recipe_id: str, updates: dict) -> Optional[dict]:
    """Update a recipe's fields and persist changes."""
    _ensure_loaded()

    recipe = get_recipe_by_id(recipe_id)
    if not recipe:
        return None

    # Allowed fields to edit
    editable_fields = {
        "name", "concept", "portions", "prep_time_minutes",
        "proposed_sale_price", "cost_in_wages"
    }

    # Apply updates
    for field_name, value in updates.items():
        if field_name in editable_fields:
            numeric_fields = {"portions", "prep_time_minutes", "proposed_sale_price", "cost_in_wages"}
            if field_name in numeric_fields and value == "":
                value = None
            elif field_name in numeric_fields and value is not None:
                try:
                    if field_name == "portions":
                        value = int(value)
                    else:
                        value = float(value)
                except (ValueError, TypeError):
                    continue

            setattr(recipe, field_name, value)

    # Recalculate costs
    recipe.recalculate_costs(_ingredients_by_id)

    # Save to JSON
    _save_recipes()

    return recipe_to_dict(recipe)


def link_recipe_ingredient(recipe_id: str, ingredient_index: int, master_ingredient_id: str) -> Optional[dict]:
    """
    Link a recipe ingredient to a master ingredient.
    This enables auto-updating of costs when the master ingredient price changes.
    """
    _ensure_loaded()

    recipe = get_recipe_by_id(recipe_id)
    if not recipe:
        return None

    if ingredient_index < 0 or ingredient_index >= len(recipe.ingredients):
        return None

    master = _ingredients_by_id.get(master_ingredient_id)
    if not master:
        return None

    # Update the link
    recipe_ing = recipe.ingredients[ingredient_index]
    recipe_ing.ingredient_id = master_ingredient_id
    recipe_ing.match_confidence = 1.0
    recipe_ing.match_reason = 'manual'

    # Update cost from master
    if master.cost_per_unit is not None:
        recipe_ing.unit_cost = master.cost_per_unit
        if recipe_ing.quantity is not None:
            recipe_ing.total_cost = recipe_ing.quantity * recipe_ing.unit_cost

    # Recalculate recipe costs
    recipe.recalculate_costs(_ingredients_by_id)

    # Save
    _save_recipes()

    return recipe_to_dict(recipe)


def get_unlinked_ingredients() -> list[dict]:
    """Get all recipe ingredients that aren't linked to a master ingredient"""
    _ensure_loaded()

    unlinked = []
    for recipe in _recipes:
        for i, ing in enumerate(recipe.ingredients):
            if not ing.ingredient_id or (ing.match_confidence and ing.match_confidence < 0.8):
                unlinked.append({
                    'recipe_id': recipe.id,
                    'recipe_name': recipe.name,
                    'ingredient_index': i,
                    'ingredient_name': ing.name,
                    'unit_cost': ing.unit_cost,
                    'linked_id': ing.ingredient_id,
                    'confidence': ing.match_confidence,
                    'reason': ing.match_reason,
                })

    return unlinked


# =============================================================================
# SERIALIZATION HELPERS
# =============================================================================


def ingredient_to_dict(ing: Ingredient) -> dict:
    return {
        "id": ing.id,
        "name": ing.name,
        "category": ing.category,
        "cost": ing.cost,
        "units": ing.units,
        "cost_per_unit": round(ing.cost_per_unit, 4) if ing.cost_per_unit else None,
        "unit_sale": ing.unit_sale,
        "unit_profit": round(ing.unit_profit, 2) if ing.unit_profit else None,
        "case_profit": ing.case_profit,
        "supplier": ing.supplier,
        "notes": ing.notes,
    }


def recipe_to_dict(recipe: Recipe) -> dict:
    return {
        "id": recipe.id,
        "name": recipe.name,
        "concept": recipe.concept,
        "submitted_by": recipe.submitted_by,
        "portions": recipe.portions,
        "prep_time_minutes": recipe.prep_time_minutes,
        "proposed_sale_price": recipe.proposed_sale_price,
        "margin_factor": recipe.margin_factor,
        "cost_in_wages": round(recipe.cost_in_wages, 2) if recipe.cost_in_wages else None,
        "cost_per_portion": round(recipe.cost_per_portion, 2) if recipe.cost_per_portion else None,
        "cost_per_recipe": round(recipe.cost_per_recipe, 2) if recipe.cost_per_recipe else None,
        "time_and_cogs": round(recipe.time_and_cogs, 2) if recipe.time_and_cogs else None,
        "min_sale_price": round(recipe.min_sale_price, 2) if recipe.min_sale_price else None,
        "profit_per_sale": round(recipe.profit_per_sale, 2) if recipe.profit_per_sale else None,
        "ingredients": [
            {
                "name": ing.name,
                "ingredient_id": ing.ingredient_id,
                "quantity": ing.quantity,
                "unit_cost": round(ing.unit_cost, 4) if ing.unit_cost else None,
                "total_cost": round(ing.total_cost, 2) if ing.total_cost else None,
                "match_confidence": ing.match_confidence,
                "match_reason": ing.match_reason,
            }
            for ing in recipe.ingredients
        ],
    }


if __name__ == "__main__":
    # Test loading
    ingredients = get_ingredients()
    recipes = get_recipes()
    print(f"Loaded {len(ingredients)} ingredients and {len(recipes)} recipes")

    # Show unlinked ingredients
    unlinked = get_unlinked_ingredients()
    print(f"\nUnlinked ingredients: {len(unlinked)}")
    for item in unlinked[:5]:
        print(f"  {item['recipe_name']}: {item['ingredient_name']}")
