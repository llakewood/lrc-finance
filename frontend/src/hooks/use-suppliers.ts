/**
 * TanStack Query hooks for suppliers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  type SupplierCreateData,
  type SupplierUpdateData,
} from '../lib/api'

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
}

export function useSuppliers() {
  return useQuery({
    queryKey: supplierKeys.lists(),
    queryFn: getSuppliers,
  })
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => getSupplier(id),
    enabled: !!id,
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SupplierCreateData) => createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierUpdateData }) =>
      updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() })
      queryClient.invalidateQueries({ queryKey: supplierKeys.details() })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() })
    },
  })
}
