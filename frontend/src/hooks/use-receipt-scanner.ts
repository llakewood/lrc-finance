/**
 * TanStack Query hooks for receipt scanning
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { getReceiptScanStatus, scanReceipt } from '../lib/api'

export const receiptKeys = {
  all: ['receipts'] as const,
  status: () => [...receiptKeys.all, 'status'] as const,
}

export function useReceiptScanStatus() {
  return useQuery({
    queryKey: receiptKeys.status(),
    queryFn: getReceiptScanStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes - status doesn't change often
  })
}

export function useScanReceipt() {
  return useMutation({
    mutationFn: (imageFile: File) => scanReceipt(imageFile),
  })
}
