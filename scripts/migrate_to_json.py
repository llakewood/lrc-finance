#!/usr/bin/env python3
"""
Migration script: Export Excel data to JSON with ingredient linking.
This is a one-time migration to move from Excel-based storage to JSON.
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import json
import re
from difflib import SequenceMatcher
from data.recipes import (
    load_all_data,
    _load_edits,
    _load_recipe_edits,
    generate_ingredient_id,
)

DATA_DIR = Path(__file__).parent.parent / "data"
INGREDIENTS_FILE = DATA_DIR / "ingredients.json"
RECIPES_FILE = DATA_DIR / "recipes.json"


# Known metadata words that aren't ingredients
METADATA_WORDS = {
    'lunch', 'soup', 'breakfast', 'biscuit', 'prep table', 'baked goods',
    'freezer', 'salads', 'dressing', 'unit = unit of measure for ingredients',
    's', 'category', 'prep area', 'slow cooker', 'drink', 'drinks'
}

# Pattern for numeric-only strings (from Excel formulas)
NUMERIC_PATTERN = re.compile(r'^[\d.]+$')


def is_valid_ingredient(ing_name: str, quantity: float | None, unit_cost: float | None) -> bool:
    """Check if this is a valid ingredient entry (not metadata)"""
    if not ing_name:
        return False

    name_lower = ing_name.lower().strip()

    # Filter out known metadata
    if name_lower in METADATA_WORDS:
        return False

    # Filter out numeric-only entries (Excel formula results)
    if NUMERIC_PATTERN.match(name_lower):
        return False

    # If no quantity AND no unit_cost, it's likely metadata
    if quantity is None and unit_cost is None:
        return False

    return True


def normalize_name(name: str) -> str:
    """Normalize ingredient name for matching"""
    if not name:
        return ""
    # Lowercase, remove extra spaces, remove common suffixes/prefixes
    name = name.lower().strip()
    # Remove common measurement annotations
    name = re.sub(r'\s*\([^)]*\)\s*', ' ', name)  # Remove parenthetical content
    name = re.sub(r'\s*-\s*.*$', '', name)  # Remove dash and everything after
    name = re.sub(r'\s+', ' ', name)  # Normalize spaces
    return name.strip()


def similarity_score(a: str, b: str) -> float:
    """Calculate similarity between two strings (0-1)"""
    return SequenceMatcher(None, normalize_name(a), normalize_name(b)).ratio()


def find_best_ingredient_match(
    recipe_ing_name: str,
    recipe_ing_unit_cost: float | None,
    master_ingredients: list[dict],
    threshold: float = 0.6
) -> tuple[str | None, float, str]:
    """
    Find the best matching master ingredient for a recipe ingredient.

    Returns: (ingredient_id, confidence, match_reason)
    - ingredient_id: ID of best match, or None if no good match
    - confidence: 0-1 score
    - match_reason: 'exact', 'fuzzy', 'cost_hint', or 'no_match'
    """
    if not recipe_ing_name:
        return None, 0.0, 'no_match'

    normalized_recipe = normalize_name(recipe_ing_name)
    best_match = None
    best_score = 0.0
    best_reason = 'no_match'

    # First pass: look for exact or near-exact matches
    for ing in master_ingredients:
        master_name = ing.get('name', '')
        normalized_master = normalize_name(master_name)

        # Exact match (after normalization)
        if normalized_recipe == normalized_master:
            return ing['id'], 1.0, 'exact'

        # Check if one contains the other
        if normalized_recipe in normalized_master or normalized_master in normalized_recipe:
            score = 0.9
            if score > best_score:
                best_match = ing
                best_score = score
                best_reason = 'contains'

    # Second pass: fuzzy matching
    for ing in master_ingredients:
        score = similarity_score(recipe_ing_name, ing.get('name', ''))

        # If we have unit cost data, boost score for matching costs
        if recipe_ing_unit_cost and ing.get('cost_per_unit'):
            cost_diff = abs(recipe_ing_unit_cost - ing['cost_per_unit'])
            if cost_diff < 0.01:  # Very close costs
                score += 0.2
            elif cost_diff < 0.1:
                score += 0.1

        if score > best_score:
            best_match = ing
            best_score = score
            if recipe_ing_unit_cost and ing.get('cost_per_unit'):
                cost_diff = abs(recipe_ing_unit_cost - ing['cost_per_unit'])
                if cost_diff < 0.1:
                    best_reason = 'cost_hint'
                else:
                    best_reason = 'fuzzy'
            else:
                best_reason = 'fuzzy'

    if best_match and best_score >= threshold:
        return best_match['id'], best_score, best_reason

    return None, best_score, 'no_match'


def migrate_ingredients(ingredients, edits) -> list[dict]:
    """Convert ingredient objects to JSON-ready dicts with edits applied"""
    result = []
    deleted_ids = set()

    # Track deleted ingredients
    for ing_id, edit in edits.items():
        if edit.get('_deleted'):
            deleted_ids.add(ing_id)

    # Convert existing ingredients
    for ing in ingredients:
        if ing.id in deleted_ids:
            continue

        data = {
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
        }

        # Apply edits
        if ing.id in edits:
            edit = edits[ing.id]
            for key, value in edit.items():
                if key not in ('_deleted', '_is_new') and key in data:
                    data[key] = value

            # Recalculate derived values
            if data['cost'] is not None and data['units'] is not None and data['units'] > 0:
                data['cost_per_unit'] = round(data['cost'] / data['units'], 4)
            if data['unit_sale'] is not None and data['cost_per_unit'] is not None:
                data['unit_profit'] = round(data['unit_sale'] - data['cost_per_unit'], 2)

        result.append(data)

    # Add new ingredients (those with _is_new flag)
    for ing_id, edit in edits.items():
        if edit.get('_is_new') and ing_id not in deleted_ids:
            # Check if we already added it
            if any(r['id'] == ing_id for r in result):
                continue

            data = {
                'id': ing_id,
                'name': edit.get('name', 'Unknown'),
                'category': edit.get('category', 'Uncategorized'),
                'cost': edit.get('cost'),
                'units': edit.get('units'),
                'cost_per_unit': None,
                'unit_sale': edit.get('unit_sale'),
                'unit_profit': None,
                'case_profit': None,
                'supplier': edit.get('supplier'),
                'notes': edit.get('notes'),
            }

            # Calculate derived values
            if data['cost'] is not None and data['units'] is not None and data['units'] > 0:
                data['cost_per_unit'] = round(data['cost'] / data['units'], 4)
            if data['unit_sale'] is not None and data['cost_per_unit'] is not None:
                data['unit_profit'] = round(data['unit_sale'] - data['cost_per_unit'], 2)

            result.append(data)

    return result


def migrate_recipes(recipes, recipe_edits, master_ingredients) -> tuple[list[dict], list[dict]]:
    """
    Convert recipe objects to JSON-ready dicts with ingredient linking.

    Returns: (recipes_list, unmatched_ingredients_list)
    """
    deleted_ids = set()
    for recipe_id, edit in recipe_edits.items():
        if edit.get('_deleted'):
            deleted_ids.add(recipe_id)

    result = []
    unmatched = []

    for recipe in recipes:
        if recipe.id in deleted_ids:
            continue

        data = {
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

        # Apply recipe edits
        if recipe.id in recipe_edits:
            edit = recipe_edits[recipe.id]
            for key, value in edit.items():
                if key not in ('_deleted',) and key in data:
                    data[key] = value

        # Process ingredients with linking
        for ing in recipe.ingredients:
            # Skip invalid entries (metadata, not real ingredients)
            if not is_valid_ingredient(ing.name, ing.quantity, ing.unit_cost):
                continue

            # Try to find matching master ingredient
            match_id, confidence, reason = find_best_ingredient_match(
                ing.name,
                ing.unit_cost,
                master_ingredients
            )

            ing_data = {
                'name': ing.name,
                'quantity': ing.quantity,
                'unit_cost': round(ing.unit_cost, 4) if ing.unit_cost else None,
                'total_cost': round(ing.total_cost, 2) if ing.total_cost else None,
                'ingredient_id': match_id,  # Link to master ingredient
                'match_confidence': round(confidence, 2),
                'match_reason': reason,
            }

            data['ingredients'].append(ing_data)

            # Track unmatched for review
            if not match_id or confidence < 0.8:
                unmatched.append({
                    'recipe_name': recipe.name,
                    'recipe_id': recipe.id,
                    'ingredient_name': ing.name,
                    'unit_cost': ing.unit_cost,
                    'matched_id': match_id,
                    'confidence': round(confidence, 2),
                    'reason': reason,
                })

        result.append(data)

    return result, unmatched


def main():
    print("Loading data from Excel...")
    ingredients, recipes = load_all_data()
    print(f"  Loaded {len(ingredients)} ingredients, {len(recipes)} recipes")

    # Load edits
    ingredient_edits = _load_edits()
    recipe_edits = _load_recipe_edits()
    print(f"  Found {len(ingredient_edits)} ingredient edits, {len(recipe_edits)} recipe edits")

    # Migrate ingredients
    print("\nMigrating ingredients...")
    migrated_ingredients = migrate_ingredients(ingredients, ingredient_edits)
    print(f"  Exported {len(migrated_ingredients)} ingredients")

    # Save ingredients
    with open(INGREDIENTS_FILE, 'w') as f:
        json.dump(migrated_ingredients, f, indent=2)
    print(f"  Saved to {INGREDIENTS_FILE}")

    # Migrate recipes with ingredient linking
    print("\nMigrating recipes with ingredient linking...")
    migrated_recipes, unmatched = migrate_recipes(recipes, recipe_edits, migrated_ingredients)
    print(f"  Exported {len(migrated_recipes)} recipes")

    # Save recipes
    with open(RECIPES_FILE, 'w') as f:
        json.dump(migrated_recipes, f, indent=2)
    print(f"  Saved to {RECIPES_FILE}")

    # Report unmatched ingredients
    if unmatched:
        print(f"\n{'='*60}")
        print(f"INGREDIENTS NEEDING REVIEW ({len(unmatched)} items)")
        print(f"{'='*60}")

        # Group by recipe
        by_recipe = {}
        for item in unmatched:
            recipe = item['recipe_name']
            if recipe not in by_recipe:
                by_recipe[recipe] = []
            by_recipe[recipe].append(item)

        for recipe_name, items in by_recipe.items():
            print(f"\n{recipe_name}:")
            for item in items:
                status = "NO MATCH" if not item['matched_id'] else f"LOW CONFIDENCE ({item['confidence']:.0%})"
                print(f"  - {item['ingredient_name']}: {status}")
                if item['matched_id']:
                    # Find the matched ingredient name
                    matched_ing = next((i for i in migrated_ingredients if i['id'] == item['matched_id']), None)
                    if matched_ing:
                        print(f"    -> Suggested: {matched_ing['name']} (reason: {item['reason']})")

        # Save unmatched for manual review
        unmatched_file = DATA_DIR / "unmatched_ingredients.json"
        with open(unmatched_file, 'w') as f:
            json.dump(unmatched, f, indent=2)
        print(f"\n  Saved unmatched list to {unmatched_file}")
    else:
        print("\n  All ingredients matched successfully!")

    print("\nMigration complete!")
    print(f"  - Ingredients: {INGREDIENTS_FILE}")
    print(f"  - Recipes: {RECIPES_FILE}")


if __name__ == "__main__":
    main()
