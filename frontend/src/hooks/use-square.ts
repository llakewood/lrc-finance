/**
 * TanStack Query hooks for Square integration
 * Includes localStorage persistence for offline support
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSquareStatus,
  getSquareSales,
  getSquareProductMix,
  getSquareTeam,
  refreshSquareData,
} from '../lib/api'
import { saveToCache, loadFromCache } from '../lib/query-cache'
import type { SquareStatus, SquareSaleDay, SquareProductMix, SquareTeamData } from '../lib/api-types'

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
    queryFn: async () => {
      const data = await getSquareStatus()
      saveToCache('square-status', data)
      return data
    },
    initialData: () => loadFromCache<SquareStatus>('square-status')?.data,
  })
}

export function useSquareSales(days = 30) {
  const cacheKey = `square-sales-${days}`
  return useQuery({
    queryKey: squareKeys.sales(days),
    queryFn: async () => {
      const data = await getSquareSales(days)
      saveToCache(cacheKey, data)
      return data
    },
    initialData: () => loadFromCache<SquareSaleDay[]>(cacheKey)?.data,
  })
}

export function useSquareProductMix(days = 30) {
  const cacheKey = `square-productmix-${days}`
  return useQuery({
    queryKey: squareKeys.productMix(days),
    queryFn: async () => {
      const data = await getSquareProductMix(days)
      saveToCache(cacheKey, data)
      return data
    },
    initialData: () => loadFromCache<SquareProductMix>(cacheKey)?.data,
  })
}

export function useSquareTeam() {
  const cacheKey = 'square-team'
  return useQuery({
    queryKey: squareKeys.team(),
    queryFn: async () => {
      const data = await getSquareTeam()
      saveToCache(cacheKey, data)
      return data
    },
    initialData: () => loadFromCache<SquareTeamData>(cacheKey)?.data,
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
