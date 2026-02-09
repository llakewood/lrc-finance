/**
 * TanStack Query hooks for inventory and price analytics
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getInventory,
  getInventoryItem,
  updateInventoryItem,
  getLowStockItems,
  getPriceHistory,
  getPriceAlerts,
  type InventoryUpdateData,
} from '../lib/api'

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (ingredientId: string) => [...inventoryKeys.details(), ingredientId] as const,
  lowStock: () => [...inventoryKeys.all, 'low-stock'] as const,
}

export const priceKeys = {
  all: ['prices'] as const,
  history: () => [...priceKeys.all, 'history'] as const,
  historyItem: (ingredientId: string, days: number) =>
    [...priceKeys.history(), ingredientId, days] as const,
  alerts: () => [...priceKeys.all, 'alerts'] as const,
  alertsList: (days: number, minChange: number) =>
    [...priceKeys.alerts(), { days, minChange }] as const,
}

// Inventory hooks
export function useInventory() {
  return useQuery({
    queryKey: inventoryKeys.lists(),
    queryFn: getInventory,
  })
}

export function useInventoryItem(ingredientId: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(ingredientId),
    queryFn: () => getInventoryItem(ingredientId),
    enabled: !!ingredientId,
  })
}

export function useUpdateInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      ingredientId,
      data,
    }: {
      ingredientId: string
      data: InventoryUpdateData
    }) => updateInventoryItem(ingredientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.details() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() })
    },
  })
}

export function useLowStockItems() {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: getLowStockItems,
  })
}

// Price analytics hooks
export function usePriceHistory(ingredientId: string, days = 90) {
  return useQuery({
    queryKey: priceKeys.historyItem(ingredientId, days),
    queryFn: () => getPriceHistory(ingredientId, days),
    enabled: !!ingredientId,
  })
}

export function usePriceAlerts(days = 30, minChangePercent = 5) {
  return useQuery({
    queryKey: priceKeys.alertsList(days, minChangePercent),
    queryFn: () => getPriceAlerts(days, minChangePercent),
  })
}
