/**
 * TanStack Query hooks for purchases
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPurchases,
  getPurchase,
  createPurchase,
  createBatchPurchase,
  updatePurchase,
  deletePurchase,
  type PurchaseCreateData,
  type PurchaseUpdateData,
  type BatchPurchaseData,
} from '../lib/api'
import { inventoryKeys } from './use-inventory'

export const purchaseKeys = {
  all: ['purchases'] as const,
  lists: () => [...purchaseKeys.all, 'list'] as const,
  list: (ingredientId?: string, supplierId?: string, days?: number) =>
    [...purchaseKeys.lists(), { ingredientId, supplierId, days }] as const,
  details: () => [...purchaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseKeys.details(), id] as const,
}

export function usePurchases(
  ingredientId?: string,
  supplierId?: string,
  days = 90
) {
  return useQuery({
    queryKey: purchaseKeys.list(ingredientId, supplierId, days),
    queryFn: () => getPurchases(ingredientId, supplierId, days),
  })
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => getPurchase(id),
    enabled: !!id,
  })
}

export function useCreatePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PurchaseCreateData) => createPurchase(data),
    onSuccess: () => {
      // Invalidate purchase lists
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() })
      // Also invalidate inventory since it may have been updated
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
    },
  })
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseUpdateData }) =>
      updatePurchase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: purchaseKeys.details() })
    },
  })
}

export function useDeletePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePurchase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() })
    },
  })
}

export function useCreateBatchPurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BatchPurchaseData) => createBatchPurchase(data),
    onSuccess: () => {
      // Invalidate purchase lists
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() })
      // Also invalidate inventory since it may have been updated
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
    },
  })
}
