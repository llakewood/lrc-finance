/**
 * TanStack Query hooks for Square integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSquareStatus,
  getSquareSales,
  getSquareProductMix,
  getSquareTeam,
  refreshSquareData,
} from '../lib/api'

export const squareKeys = {
  all: ['square'] as const,
  status: () => [...squareKeys.all, 'status'] as const,
  sales: (days: number) => [...squareKeys.all, 'sales', days] as const,
  productMix: (days: number) => [...squareKeys.all, 'productMix', days] as const,
  team: () => [...squareKeys.all, 'team'] as const,
}

export function useSquareStatus() {
  return useQuery({
    queryKey: squareKeys.status(),
    queryFn: getSquareStatus,
  })
}

export function useSquareSales(days = 30) {
  return useQuery({
    queryKey: squareKeys.sales(days),
    queryFn: () => getSquareSales(days),
  })
}

export function useSquareProductMix(days = 30) {
  return useQuery({
    queryKey: squareKeys.productMix(days),
    queryFn: () => getSquareProductMix(days),
  })
}

export function useSquareTeam() {
  return useQuery({
    queryKey: squareKeys.team(),
    queryFn: getSquareTeam,
  })
}

export function useRefreshSquareData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: refreshSquareData,
    onSuccess: () => {
      // Invalidate all Square queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: squareKeys.all })
    },
  })
}
