/**
 * TanStack Query hooks for ingredients
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Ingredient } from '../lib/api-types'
import {
  getIngredients,
  getIngredient,
  updateIngredient,
  createIngredient,
  deleteIngredient,
  getIngredientCategories,
} from '../lib/api'
import { recipeKeys } from './use-recipes'

export const ingredientKeys = {
  all: ['ingredients'] as const,
  lists: () => [...ingredientKeys.all, 'list'] as const,
  list: (category?: string) => [...ingredientKeys.lists(), category] as const,
  details: () => [...ingredientKeys.all, 'detail'] as const,
  detail: (id: string) => [...ingredientKeys.details(), id] as const,
  categories: () => [...ingredientKeys.all, 'categories'] as const,
}

export function useIngredients(category?: string) {
  return useQuery({
    queryKey: ingredientKeys.list(category),
    queryFn: () => getIngredients(category),
  })
}

export function useIngredient(id: string) {
  return useQuery({
    queryKey: ingredientKeys.detail(id),
    queryFn: () => getIngredient(id),
    enabled: !!id,
  })
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<Pick<Ingredient, 'name' | 'unit' | 'unit_cost' | 'category'>>
    }) => updateIngredient(id, data),
    onSuccess: () => {
      // Invalidate ingredient lists and details
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ingredientKeys.details() })
      // Also invalidate recipes since they depend on ingredient costs
      queryClient.invalidateQueries({ queryKey: recipeKeys.all })
    },
  })
}

export function useCreateIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Ingredient, 'id'>) => createIngredient(data),
    onSuccess: () => {
      // Invalidate ingredient lists and categories
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ingredientKeys.categories() })
    },
  })
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteIngredient(id),
    onSuccess: () => {
      // Invalidate ingredient lists
      queryClient.invalidateQueries({ queryKey: ingredientKeys.lists() })
      // Also invalidate recipes in case they referenced this ingredient
      queryClient.invalidateQueries({ queryKey: recipeKeys.all })
    },
  })
}

export function useIngredientCategories() {
  return useQuery({
    queryKey: ingredientKeys.categories(),
    queryFn: getIngredientCategories,
  })
}
