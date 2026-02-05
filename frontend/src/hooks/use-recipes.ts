/**
 * TanStack Query hooks for recipes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Recipe } from '../lib/api-types'
import {
  getRecipes,
  getRecipe,
  updateRecipe,
  getUnlinkedIngredients,
  linkIngredient,
  reloadRecipeData,
} from '../lib/api'

export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (sortBy: string) => [...recipeKeys.lists(), sortBy] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (name: string) => [...recipeKeys.details(), name] as const,
  unlinked: () => [...recipeKeys.all, 'unlinked'] as const,
}

export function useRecipes(sortBy = 'profit') {
  return useQuery({
    queryKey: recipeKeys.list(sortBy),
    queryFn: () => getRecipes(sortBy),
  })
}

export function useRecipe(name: string) {
  return useQuery({
    queryKey: recipeKeys.detail(name),
    queryFn: () => getRecipe(name),
    enabled: !!name,
  })
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<Pick<Recipe, 'portions' | 'price' | 'prep_time' | 'labor_cost'>>
    }) => updateRecipe(id, data),
    onSuccess: () => {
      // Invalidate recipe lists and details to refetch
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: recipeKeys.details() })
    },
  })
}

export function useUnlinkedIngredients() {
  return useQuery({
    queryKey: recipeKeys.unlinked(),
    queryFn: getUnlinkedIngredients,
  })
}

export function useLinkIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      recipeId,
      ingredientIndex,
      masterIngredientId,
    }: {
      recipeId: string
      ingredientIndex: number
      masterIngredientId: string
    }) => linkIngredient(recipeId, ingredientIndex, masterIngredientId),
    onSuccess: () => {
      // Invalidate unlinked list, recipe details, and recipe lists for updated costs
      queryClient.invalidateQueries({ queryKey: recipeKeys.unlinked() })
      queryClient.invalidateQueries({ queryKey: recipeKeys.details() })
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })
    },
  })
}

export function useReloadRecipeData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reloadRecipeData,
    onSuccess: () => {
      // Invalidate all recipe queries
      queryClient.invalidateQueries({ queryKey: recipeKeys.all })
    },
  })
}
