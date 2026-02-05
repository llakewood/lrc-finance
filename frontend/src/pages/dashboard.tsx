/**
 * Main Dashboard Page
 * Composes all components to display financial overview
 */

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { DashboardLayout } from '@/components/templates/dashboard-layout'
import { SectionLayout } from '@/components/templates/section-layout'
import { GridLayout } from '@/components/templates/grid-layout'
import { MetricCard } from '@/components/molecules/metric-card'
import { ContentCard } from '@/components/molecules/content-card'
import { YearFilter } from '@/components/molecules/year-filter'
import { BenchmarkList } from '@/components/organisms/benchmark-list'
import { DebtProgress } from '@/components/organisms/debt-progress'
import { ProductMixTable } from '@/components/organisms/product-mix-table'
import { TeamGrid } from '@/components/organisms/team-grid'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { AlertBanner } from '@/components/organisms/alert-banner'

import {
  useFiscalYears,
  useSummary,
  useExpenseBreakdown,
  useBenchmarks,
  useDebtProgress,
} from '@/hooks/use-financial'
import {
  useSquareStatus,
  useSquareSales,
  useSquareProductMix,
  useSquareTeam,
  useRefreshSquareData,
} from '@/hooks/use-square'

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

  // Square data queries
  const { data: squareStatus } = useSquareStatus()
  const { data: squareSales, isLoading: salesLoading } = useSquareSales(30)
  const { data: productMix, isLoading: productMixLoading } = useSquareProductMix(30)
  const { data: teamData, isLoading: teamLoading } = useSquareTeam()

  const refreshSquare = useRefreshSquareData()

  const isLive = squareStatus?.connected ?? false
  const isLoading = summaryLoading || expensesLoading || benchmarksLoading || debtLoading

  // Handle year selection
  const years = fiscalYears?.map((fy) => ({
    value: fy.id,
    label: fy.label,
    current: fy.is_current,
  })) ?? []

  return (
    <DashboardLayout
      liveData={isLive}
      lastUpdated={squareStatus?.last_sync}
      headerActions={
        isLive && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refreshSquare.mutate()}
            disabled={refreshSquare.isPending}
          >
            {refreshSquare.isPending ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        )
      }
    >
      <div className="space-y-8">
        {/* Error Alert */}
        {summaryError && (
          <AlertBanner
            variant="error"
            title="Failed to load data"
            description={summaryError.message}
          />
        )}

        {/* Year Filter */}
        {!yearsLoading && years.length > 0 && (
          <YearFilter
            years={years}
            selectedYear={selectedYear ?? years.find((y) => y.current)?.value}
            onYearChange={setSelectedYear}
          />
        )}

        {/* Key Metrics */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <SectionLayout title="Financial Overview">
              <GridLayout columns={4}>
                <MetricCard
                  label="Total Revenue"
                  value={summary?.revenue ?? 0}
                  format="currency"
                  change={summary?.revenue_change}
                  tooltip="Total revenue for the fiscal year"
                />
                <MetricCard
                  label="Total Expenses"
                  value={summary?.expenses ?? 0}
                  format="currency"
                  change={summary?.expenses_change}
                  tooltip="Total operating expenses"
                />
                <MetricCard
                  label="Net Income"
                  value={summary?.net_income ?? 0}
                  format="currency"
                  change={summary?.net_income_change}
                  tooltip="Revenue minus expenses"
                />
                <MetricCard
                  label="Cash on Hand"
                  value={summary?.cash ?? 0}
                  format="currency"
                  tooltip="Current cash balance"
                />
              </GridLayout>
            </SectionLayout>

            {/* Expense Breakdown */}
            {expenses && (
              <SectionLayout
                title="Expense Breakdown"
                description="Cost of goods vs operating expenses"
              >
                <GridLayout columns={3}>
                  <MetricCard
                    label="Cost of Goods (COGS)"
                    value={expenses.cogs}
                    format="currency"
                    tooltip="Direct costs for products sold"
                  />
                  <MetricCard
                    label="General & Admin"
                    value={expenses.ga}
                    format="currency"
                    tooltip="Operating and administrative expenses"
                  />
                  <MetricCard
                    label="Gross Margin"
                    value={expenses.gross_margin}
                    format="percent"
                    tooltip="Revenue minus COGS as percentage"
                  />
                </GridLayout>
              </SectionLayout>
            )}

            {/* Industry Benchmarks */}
            {benchmarks && benchmarks.length > 0 && (
              <SectionLayout
                title="Industry Benchmarks"
                description="Compare your metrics against coffee shop industry standards"
              >
                <BenchmarkList benchmarks={benchmarks} />
              </SectionLayout>
            )}

            {/* Debt Progress */}
            {debtProgress && (
              <SectionLayout
                title="Debt Progress"
                description="Track your loan paydown"
              >
                <DebtProgress
                  totalDebt={debtProgress.total_debt}
                  originalDebt={debtProgress.original_debt}
                  paidOff={debtProgress.paid_off}
                  monthlyPayment={debtProgress.monthly_payment}
                  interestRate={debtProgress.interest_rate}
                  accounts={debtProgress.accounts}
                />
              </SectionLayout>
            )}
          </>
        )}

        {/* Square Live Data */}
        {isLive && (
          <>
            <SectionLayout
              title="Live Sales"
              description="Last 30 days from Square POS"
            >
              {salesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <GridLayout columns={4}>
                  <MetricCard
                    label="Total Sales"
                    value={squareSales?.total_sales ?? 0}
                    format="currency"
                  />
                  <MetricCard
                    label="Transactions"
                    value={squareSales?.transaction_count ?? 0}
                  />
                  <MetricCard
                    label="Avg Transaction"
                    value={squareSales?.average_transaction ?? 0}
                    format="currency"
                  />
                  <MetricCard
                    label="Daily Average"
                    value={squareSales?.daily_average ?? 0}
                    format="currency"
                  />
                </GridLayout>
              )}
            </SectionLayout>

            <GridLayout columns={2}>
              {/* Product Mix */}
              <SectionLayout title="Top Products" variant="card">
                {productMixLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                  </div>
                ) : (
                  <ProductMixTable
                    products={productMix?.items ?? []}
                    maxItems={5}
                    showHeader={false}
                  />
                )}
              </SectionLayout>

              {/* Team */}
              <SectionLayout title="Team" variant="card">
                {teamLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                  </div>
                ) : (
                  <TeamGrid
                    members={teamData?.members ?? []}
                    showHeader={false}
                    compact
                  />
                )}
              </SectionLayout>
            </GridLayout>
          </>
        )}
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
