/**
 * Main Dashboard Page
 * Financial Overview — accounting data for Little Red Coffee
 */

import { useState, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import {
  DashboardLayout,
  SectionLayout,
  GridLayout,
  MetricCard,
  YearFilter,
  BenchmarkList,
  DebtProgress,
  Spinner,
  AlertBanner,
} from '@lrc/frontend'

import {
  useFiscalYears,
  useSummary,
  useExpenseBreakdown,
  useBenchmarks,
  useDebtProgress,
  useMetrics,
  useCashFlowHealth,
} from '@/hooks/use-financial'
import { formatCurrency, formatPercent } from '@lrc/frontend'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function DashboardContent() {
  const [selectedYear, setSelectedYear] = useState<string | undefined>()

  // Financial data queries
  const { data: fiscalYears, isLoading: yearsLoading } = useFiscalYears()
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useSummary(selectedYear)
  const { data: expenses, isLoading: expensesLoading } = useExpenseBreakdown(selectedYear)
  const { data: benchmarks, isLoading: benchmarksLoading } = useBenchmarks(selectedYear)
  const { data: debtProgress, isLoading: debtLoading } = useDebtProgress(selectedYear)
  const { data: metrics, isLoading: metricsLoading } = useMetrics(selectedYear)
  const { data: cashFlow, isLoading: cashFlowLoading } = useCashFlowHealth(selectedYear)

  const isLoading = summaryLoading || expensesLoading || benchmarksLoading || debtLoading || metricsLoading || cashFlowLoading

  // Handle year selection
  const years = fiscalYears?.map((fy) => ({
    value: fy.label,
    label: fy.label,
    current: fy.is_current,
  })) ?? []

  // Map benchmarks to BenchmarkBar props
  const benchmarkItems = useMemo(() => {
    if (!benchmarks) return []
    return benchmarks.map((b) => ({
      label: b.metric,
      value: b.your_value,
      min: 0,
      max: Math.max(b.industry_high * 1.5, b.your_value * 1.2),
      industryLow: b.industry_low,
      industryHigh: b.industry_high,
      format: b.unit === '%' ? 'percent' as const : 'number' as const,
      info: `Industry average: ${b.industry_avg}${b.unit}`,
    }))
  }, [benchmarks])

  // Map debt progress to DebtItem props
  const debtItems = useMemo(() => {
    if (!debtProgress) return []
    return debtProgress.loans.map((loan) => ({
      name: loan.name,
      currentBalance: loan.current,
      originalBalance: loan.previous,
      change: -loan.paid_down,
    }))
  }, [debtProgress])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Error Alert */}
        {summaryError && (
          <AlertBanner
            variant="error"
            title="Failed to load data"
            description={(summaryError as Error).message}
          />
        )}

        <div className="space-y-8">
          {/* Year Filter */}
          {!yearsLoading && years.length > 0 && (
            <YearFilter
              options={years}
              value={selectedYear ?? years.find((y) => y.current)?.value}
              onValueChange={setSelectedYear}
            />
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <SectionLayout title="Key Metrics">
                <GridLayout columns={4}>
                  <MetricCard
                    label="Total Revenue"
                    value={summary?.current.total_revenue ?? 0}
                    format="currency"
                    change={summary?.changes?.revenue_pct}
                    info="All money coming into the business from sales, tips, grants, and other income sources for the fiscal year."
                  />
                  <MetricCard
                    label="Net Income"
                    value={summary?.current.net_income ?? 0}
                    format="currency"
                    info="Your actual profit after ALL expenses (COGS, rent, wages, etc.). This is what you actually keep."
                  />
                  <MetricCard
                    label="Cash Position"
                    value={summary?.current.cash ?? 0}
                    format="currency"
                    info="Money available in your bank accounts right now. Important for paying bills and handling emergencies."
                  />
                  <MetricCard
                    label="Total Debt"
                    value={summary?.current.total_debt ?? 0}
                    format="currency"
                    info="All money you owe including loans (BDC, CIBC) and shareholder loans. Lower is better!"
                  />
                </GridLayout>
              </SectionLayout>

              {/* Profitability Metrics */}
              {metrics && (
                <SectionLayout title="Profitability Metrics">
                  <GridLayout columns={4}>
                    <MetricCard
                      label="Gross Margin"
                      value={metrics.gross_margin_pct}
                      format="percent"
                      info="Revenue minus direct costs (COGS). Shows how much you keep from each sale before overhead. Coffee shops typically aim for 55-70%."
                    />
                    <MetricCard
                      label="Net Margin"
                      value={metrics.net_margin_pct}
                      format="percent"
                      info="Your profit as a percentage of revenue. Shows how much of every dollar you actually keep. Coffee shops typically range 2-10%."
                    />
                    <MetricCard
                      label="Labor Cost %"
                      value={metrics.labor_cost_pct}
                      format="percent"
                      info="Wages and payroll taxes as a percentage of revenue. Coffee shops typically run 25-35%. Lower means more efficient, but watch service quality."
                    />
                    <MetricCard
                      label="Rent %"
                      value={metrics.rent_pct}
                      format="percent"
                      info="Rent as a percentage of revenue. Coffee shops typically aim for 6-15%. Above 15% can squeeze profitability."
                    />
                  </GridLayout>
                </SectionLayout>
              )}

              {/* Industry Benchmarks + Debt Progress (side by side) */}
              <GridLayout columns={2}>
                {benchmarkItems.length > 0 && (
                  <SectionLayout
                    title="Industry Benchmarks"
                    description="Compare your metrics against coffee shop industry standards"
                    variant="card"
                  >
                    <BenchmarkList benchmarks={benchmarkItems} />
                  </SectionLayout>
                )}

                {debtItems.length > 0 && (
                  <SectionLayout
                    title="Debt Paydown Progress"
                    description="Track your loan paydown"
                    variant="card"
                  >
                    <DebtProgress debts={debtItems} />
                  </SectionLayout>
                )}
              </GridLayout>

              {/* Expense Breakdown */}
              {expenses && (
                <SectionLayout title="Expense Breakdown">
                  <GridLayout columns={2}>
                    <div className="bg-surface-card border border-border rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
                        Cost of Goods Sold
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-sm text-text-muted">Purchases</span>
                          <span className="text-sm font-medium">{formatCurrency(expenses.current.cogs.purchases)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-sm text-text-muted">Payroll</span>
                          <span className="text-sm font-medium">{formatCurrency(expenses.current.cogs.payroll)}</span>
                        </div>
                        <div className="flex justify-between py-2 font-semibold">
                          <span className="text-sm">Total COGS</span>
                          <span className="text-sm">{formatCurrency(expenses.current.cogs.total)}</span>
                        </div>
                        <div className="flex justify-between py-2 text-text-muted">
                          <span className="text-sm">% of Total Expenses</span>
                          <span className="text-sm">{formatPercent(expenses.current.cogs.pct_of_total)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface-card border border-border rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
                        General & Administrative
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-sm text-text-muted">Rent</span>
                          <span className="text-sm font-medium">{formatCurrency(expenses.current.ga.rent)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-sm text-text-muted">Insurance</span>
                          <span className="text-sm font-medium">{formatCurrency(expenses.current.ga.insurance)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-sm text-text-muted">Accounting</span>
                          <span className="text-sm font-medium">{formatCurrency(expenses.current.ga.accounting)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-sm text-text-muted">Other</span>
                          <span className="text-sm font-medium">{formatCurrency(expenses.current.ga.other)}</span>
                        </div>
                        <div className="flex justify-between py-2 font-semibold">
                          <span className="text-sm">Total G&A</span>
                          <span className="text-sm">{formatCurrency(expenses.current.ga.total)}</span>
                        </div>
                        <div className="flex justify-between py-2 text-text-muted">
                          <span className="text-sm">% of Total Expenses</span>
                          <span className="text-sm">{formatPercent(expenses.current.ga.pct_of_total)}</span>
                        </div>
                      </div>
                    </div>
                  </GridLayout>
                </SectionLayout>
              )}

              {/* Cash Flow Health */}
              {cashFlow && (
                <SectionLayout title="Cash Flow Health">
                  <GridLayout columns={4}>
                    <MetricCard
                      label="Monthly Avg Revenue"
                      value={cashFlow.monthly_averages.revenue}
                      format="currency"
                      info="Your annual revenue divided by 12. Helps you understand typical monthly income patterns."
                    />
                    <MetricCard
                      label="Monthly Avg Expenses"
                      value={cashFlow.monthly_averages.expenses}
                      format="currency"
                      info="Your annual expenses divided by 12. Use this to plan your monthly cash needs."
                    />
                    <MetricCard
                      label="Monthly Net Income"
                      value={cashFlow.monthly_averages.net_income}
                      format="currency"
                      info="Average monthly profit. This is roughly what you can expect to have left each month after all expenses."
                    />
                    <MetricCard
                      label="Current Ratio"
                      value={cashFlow.liquidity.current_ratio}
                      info="Current assets / current liabilities. Measures ability to pay short-term debts. Above 1.0 is good, above 2.0 is very healthy."
                    />
                  </GridLayout>
                </SectionLayout>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  )
}

export default Dashboard
