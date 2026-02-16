/**
 * TanStack Query hooks for Square menu verification
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMenuVerification, type MenuVerificationOptions } from '../lib/api'
import { saveToCache, loadFromCache } from '../lib/query-cache'
import type { MenuVerificationResponse } from '../lib/api-types'

export const menuVerificationKeys = {
  all: ['menuVerification'] as const,
  verify: (options?: MenuVerificationOptions) =>
    [...menuVerificationKeys.all, 'verify', options] as const,
}

export function useMenuVerification(options: MenuVerificationOptions = {}) {
  const cacheKey = `menu-verification-${options.matchThreshold ?? 0.6}-${options.priceTolerance ?? 0.01}`

  return useQuery({
    queryKey: menuVerificationKeys.verify(options),
    queryFn: async () => {
      const data = await getMenuVerification(options)
      saveToCache(cacheKey, data)
      return data
    },
    initialData: () => loadFromCache<MenuVerificationResponse>(cacheKey)?.data,
    // Don't refetch automatically - user controls when to verify
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useRefreshMenuVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => getMenuVerification({ refresh: true }),
    onSuccess: (data) => {
      // Update the cache with fresh data
      queryClient.setQueryData(menuVerificationKeys.verify({}), data)
      queryClient.invalidateQueries({ queryKey: menuVerificationKeys.all })
    },
  })
}
