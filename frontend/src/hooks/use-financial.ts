/**
 * TanStack Query hooks for financial data
 */

import { useQuery } from '@tanstack/react-query'
import {
  getFiscalYears,
  getSummary,
  getExpenseBreakdown,
  getBenchmarks,
  getDebtProgress,
} from '../lib/api'

export const financialKeys = {
  all: ['financial'] as const,
  fiscalYears: () => [...financialKeys.all, 'fiscalYears'] as const,
  summary: (fiscalYear?: string) => [...financialKeys.all, 'summary', fiscalYear] as const,
  expenses: (fiscalYear?: string) => [...financialKeys.all, 'expenses', fiscalYear] as const,
  benchmarks: (fiscalYear?: string) => [...financialKeys.all, 'benchmarks', fiscalYear] as const,
  debt: (fiscalYear?: string) => [...financialKeys.all, 'debt', fiscalYear] as const,
}

export function useFiscalYears() {
  return useQuery({
    queryKey: financialKeys.fiscalYears(),
    queryFn: getFiscalYears,
  })
}

export function useSummary(fiscalYear?: string) {
  return useQuery({
    queryKey: financialKeys.summary(fiscalYear),
    queryFn: () => getSummary(fiscalYear),
  })
}

export function useExpenseBreakdown(fiscalYear?: string) {
  return useQuery({
    queryKey: financialKeys.expenses(fiscalYear),
    queryFn: () => getExpenseBreakdown(fiscalYear),
  })
}

export function useBenchmarks(fiscalYear?: string) {
  return useQuery({
    queryKey: financialKeys.benchmarks(fiscalYear),
    queryFn: () => getBenchmarks(fiscalYear),
  })
}

export function useDebtProgress(fiscalYear?: string) {
  return useQuery({
    queryKey: financialKeys.debt(fiscalYear),
    queryFn: () => getDebtProgress(fiscalYear),
  })
}
