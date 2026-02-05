/**
 * Main Dashboard Page
 * Matches the structure of templates/Dashboard.html
 */

import { useState, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { DashboardLayout } from '@/components/templates/dashboard-layout'
import { SectionLayout } from '@/components/templates/section-layout'
import { GridLayout } from '@/components/templates/grid-layout'
import { MetricCard } from '@/components/molecules/metric-card'
import { YearFilter } from '@/components/molecules/year-filter'
import { BenchmarkList } from '@/components/organisms/benchmark-list'
import { DebtProgress } from '@/components/organisms/debt-progress'
import { ProductMixTable } from '@/components/organisms/product-mix-table'
import { TeamGrid } from '@/components/organisms/team-grid'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/organisms/tabs'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { AlertBanner } from '@/components/organisms/alert-banner'
import { StatusDot } from '@/components/ui/status-dot'
import { IngredientLinkingModal } from '@/components/organisms/ingredient-linking-modal'

import {
  useFiscalYears,
  useSummary,
  useExpenseBreakdown,
  useBenchmarks,
  useDebtProgress,
  useMetrics,
  useCashFlowHealth,
} from '@/hooks/use-financial'
import {
  useSquareStatus,
  useSquareSales,
  useSquareProductMix,
  useSquareTeam,
  useRefreshSquareData,
} from '@/hooks/use-square'
import {
  useRecipes,
  useUnlinkedIngredients,
  useUpdateRecipe,
} from '@/hooks/use-recipes'
import {
  useIngredients,
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
  useIngredientCategories,
} from '@/hooks/use-ingredients'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

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
  const [activeTab, setActiveTab] = useState('financials')
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)
  const [showAddIngredient, setShowAddIngredient] = useState(false)
  const [showLinkingModal, setShowLinkingModal] = useState(false)
  const [isEditingRecipe, setIsEditingRecipe] = useState(false)
  const [recipeEditForm, setRecipeEditForm] = useState({
    portions: 0,
    proposed_sale_price: 0,
    prep_time_minutes: 0,
    cost_in_wages: 0,
  })
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    category: '',
    unit: '',
    unit_cost: 0,
  })
  const [recipeFilter, setRecipeFilter] = useState('')
  const [ingredientFilter, setIngredientFilter] = useState('')
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null)
  const [ingredientEditForm, setIngredientEditForm] = useState({
    name: '',
    category: '',
    cost: 0,
    units: 0,
    supplier: '',
  })

  // Financial data queries
  const { data: fiscalYears, isLoading: yearsLoading } = useFiscalYears()
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useSummary(selectedYear)
  const { data: expenses, isLoading: expensesLoading } = useExpenseBreakdown(selectedYear)
  const { data: benchmarks, isLoading: benchmarksLoading } = useBenchmarks(selectedYear)
  const { data: debtProgress, isLoading: debtLoading } = useDebtProgress(selectedYear)
  const { data: metrics, isLoading: metricsLoading } = useMetrics(selectedYear)
  const { data: cashFlow, isLoading: cashFlowLoading } = useCashFlowHealth(selectedYear)

  // Square data queries
  const { data: squareStatus } = useSquareStatus()
  const { data: squareSales, isLoading: salesLoading } = useSquareSales(30)
  const { data: productMix, isLoading: productMixLoading } = useSquareProductMix(30)
  const { data: teamData, isLoading: teamLoading } = useSquareTeam()

  const refreshSquare = useRefreshSquareData()

  // Recipe data queries
  const { data: recipes, isLoading: recipesLoading } = useRecipes('profit')
  const { data: unlinkedIngredients } = useUnlinkedIngredients()
  const updateRecipe = useUpdateRecipe()

  // Ingredient data queries
  const { data: ingredients, isLoading: ingredientsLoading } = useIngredients()
  const { data: ingredientCategories } = useIngredientCategories()
  const createIngredient = useCreateIngredient()
  const updateIngredientMutation = useUpdateIngredient()
  const deleteIngredientMutation = useDeleteIngredient()

  const isLive = squareStatus?.connected ?? false
  const isLoading = summaryLoading || expensesLoading || benchmarksLoading || debtLoading || metricsLoading || cashFlowLoading

  // Handle year selection
  const years = fiscalYears?.map((fy) => ({
    value: fy.label,
    label: fy.label,
    current: fy.is_current,
  })) ?? []

  // Compute aggregated sales data from daily sales array
  const salesAggregates = useMemo(() => {
    if (!squareSales || squareSales.length === 0) return null
    const totalRevenue = squareSales.reduce((sum, day) => sum + day.revenue, 0)
    const totalOrders = squareSales.reduce((sum, day) => sum + day.order_count, 0)
    const totalItems = squareSales.reduce((sum, day) => sum + day.items_sold, 0)
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0
    return { totalRevenue, totalOrders, totalItems, avgTicket }
  }, [squareSales])

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

  // Map product mix to ProductRow props
  const productItems = useMemo(() => {
    if (!productMix) return []
    return productMix.top_items.map((item, index) => ({
      rank: index + 1,
      name: item.name,
      revenue: item.revenue,
      quantity: item.quantity,
      percentOfTotal: item.pct_of_revenue,
    }))
  }, [productMix])

  // Map team members to TeamMemberCard props
  const teamMembers = useMemo(() => {
    if (!teamData) return []
    return teamData.team_members.map((member) => ({
      name: member.name,
      status: member.status.toLowerCase() as 'active' | 'inactive',
    }))
  }, [teamData])

  // Recipe summary stats
  const recipeStats = useMemo(() => {
    if (!recipes || recipes.length === 0) return null
    const profitable = recipes.filter((r) => r.profit_per_batch > 0).length
    const needsAttention = recipes.filter((r) => r.profit_per_batch <= 0).length
    const avgCost = recipes.reduce((sum, r) => sum + r.total_cost, 0) / recipes.length
    return {
      total: recipes.length,
      profitable,
      needsAttention,
      avgCost,
    }
  }, [recipes])

  // Get selected recipe detail
  const selectedRecipeData = useMemo(() => {
    if (!selectedRecipe || !recipes) return null
    return recipes.find((r) => r.name === selectedRecipe) ?? null
  }, [selectedRecipe, recipes])

  // Filter recipes by name
  const filteredRecipes = useMemo(() => {
    if (!recipes) return []
    if (!recipeFilter.trim()) return recipes
    const searchTerm = recipeFilter.toLowerCase().trim()
    return recipes.filter((r) => r.name.toLowerCase().includes(searchTerm))
  }, [recipes, recipeFilter])

  // Filter ingredients by name or supplier
  const filteredIngredients = useMemo(() => {
    if (!ingredients) return []
    if (!ingredientFilter.trim()) return ingredients
    const searchTerm = ingredientFilter.toLowerCase().trim()
    return ingredients.filter(
      (i) =>
        i.name.toLowerCase().includes(searchTerm) ||
        (i.supplier && i.supplier.toLowerCase().includes(searchTerm))
    )
  }, [ingredients, ingredientFilter])

  // Build a map of ingredient ID to recipe names that use it
  const ingredientRecipeMap = useMemo(() => {
    const map: Record<string, string[]> = {}
    if (!recipes) return map
    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ing) => {
        if (ing.ingredient_id) {
          if (!map[ing.ingredient_id]) {
            map[ing.ingredient_id] = []
          }
          if (!map[ing.ingredient_id].includes(recipe.name)) {
            map[ing.ingredient_id].push(recipe.name)
          }
        }
      })
    })
    return map
  }, [recipes])

  // Handle add ingredient form submission
  const handleAddIngredient = () => {
    if (!newIngredient.name || !newIngredient.unit) return
    createIngredient.mutate(newIngredient, {
      onSuccess: () => {
        setShowAddIngredient(false)
        setNewIngredient({ name: '', category: '', unit: '', unit_cost: 0 })
      },
    })
  }

  // Start editing a recipe
  const startRecipeEdit = () => {
    if (!selectedRecipeData) return
    setRecipeEditForm({
      portions: selectedRecipeData.portions || 1,
      proposed_sale_price: selectedRecipeData.price || 0,
      prep_time_minutes: selectedRecipeData.prep_time_minutes || 0,
      cost_in_wages: selectedRecipeData.cost_in_wages || 0,
    })
    setIsEditingRecipe(true)
  }

  // Cancel editing
  const cancelRecipeEdit = () => {
    setIsEditingRecipe(false)
  }

  // Save recipe changes
  const saveRecipeEdit = () => {
    if (!selectedRecipeData) return
    updateRecipe.mutate(
      {
        id: selectedRecipeData.id,
        data: {
          portions: recipeEditForm.portions,
          proposed_sale_price: recipeEditForm.proposed_sale_price,
          prep_time_minutes: recipeEditForm.prep_time_minutes || undefined,
          cost_in_wages: recipeEditForm.cost_in_wages || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditingRecipe(false)
        },
      }
    )
  }

  // Calculate preview values while editing
  const editPreview = useMemo(() => {
    if (!selectedRecipeData || !isEditingRecipe) return null
    const batchCost = selectedRecipeData.total_cost
    const batchRevenue = recipeEditForm.proposed_sale_price * recipeEditForm.portions
    const batchProfit = batchRevenue - batchCost
    const marginPct = batchRevenue > 0 ? (batchProfit / batchRevenue) * 100 : 0
    return { batchCost, batchRevenue, batchProfit, marginPct }
  }, [selectedRecipeData, isEditingRecipe, recipeEditForm])

  // Start editing an ingredient
  const startIngredientEdit = (ingredient: typeof ingredients extends (infer T)[] ? T : never) => {
    setEditingIngredientId(ingredient.id)
    setIngredientEditForm({
      name: ingredient.name || '',
      category: ingredient.category || '',
      cost: ingredient.cost || 0,
      units: ingredient.units || 0,
      supplier: ingredient.supplier || '',
    })
  }

  // Cancel ingredient editing
  const cancelIngredientEdit = () => {
    setEditingIngredientId(null)
  }

  // Save ingredient changes
  const saveIngredientEdit = () => {
    if (!editingIngredientId) return
    updateIngredientMutation.mutate(
      {
        id: editingIngredientId,
        data: {
          name: ingredientEditForm.name,
          category: ingredientEditForm.category || undefined,
          cost: ingredientEditForm.cost || undefined,
          units: ingredientEditForm.units || undefined,
          supplier: ingredientEditForm.supplier || undefined,
        },
      },
      {
        onSuccess: () => {
          setEditingIngredientId(null)
        },
      }
    )
  }

  // Delete an ingredient
  const handleDeleteIngredient = (id: string, name: string) => {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`)
    if (!confirmed) return
    deleteIngredientMutation.mutate(id, {
      onError: (error) => {
        console.error('Failed to delete ingredient:', error)
        window.alert(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`)
      },
    })
  }

  return (
    <DashboardLayout
      liveData={isLive}
      headerActions={
        isLive && activeTab === 'pos' && (
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
      <div className="space-y-6">
        {/* Error Alert */}
        {summaryError && (
          <AlertBanner
            variant="error"
            title="Failed to load data"
            description={(summaryError as Error).message}
          />
        )}

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="financials">Financial Overview</TabsTrigger>
            <TabsTrigger value="pos">
              <span className="flex items-center gap-2">
                Live POS Data
                {isLive && (
                  <Badge variant="success" size="sm" className="flex items-center gap-1">
                    <StatusDot variant="success" pulse size="sm" />
                    Live
                  </Badge>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="recipes">Recipe Costing</TabsTrigger>
          </TabsList>

          {/* Tab 1: Financial Overview */}
          <TabsContent value="financials">
            <div className="space-y-8">
              {/* Year Filter */}
              {!yearsLoading && years.length > 0 && (
                <YearFilter
                  options={years}
                  value={selectedYear ?? years.find((y) => y.current)?.value}
                  onValueChange={setSelectedYear}
                />
              )}

              {/* Key Metrics */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : (
                <>
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
          </TabsContent>

          {/* Tab 2: Live POS Data */}
          <TabsContent value="pos">
            <div className="space-y-8">
              {!isLive ? (
                <AlertBanner
                  variant="info"
                  title="Square not connected"
                  description="Connect your Square POS to see live sales data."
                />
              ) : (
                <>
                  {/* Live Sales Metrics */}
                  <SectionLayout
                    title="Live POS Data (Last 30 Days)"
                    actions={
                      <Badge variant="success" size="sm" className="flex items-center gap-1">
                        <StatusDot variant="success" pulse size="sm" />
                        Live
                      </Badge>
                    }
                  >
                    {salesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Spinner />
                      </div>
                    ) : salesAggregates ? (
                      <GridLayout columns={4}>
                        <MetricCard
                          label="POS Revenue"
                          value={salesAggregates.totalRevenue}
                          format="currency"
                          info="Total sales recorded in Square POS for the last 30 days. This is real-time data from your register."
                        />
                        <MetricCard
                          label="Orders"
                          value={salesAggregates.totalOrders}
                          info="Number of completed transactions in the last 30 days. More orders = more customers served."
                        />
                        <MetricCard
                          label="Items Sold"
                          value={salesAggregates.totalItems}
                          info="Total number of individual items sold. Higher than order count means customers are buying multiple items."
                        />
                        <MetricCard
                          label="Avg Ticket"
                          value={salesAggregates.avgTicket}
                          format="currency"
                          info="Average $ per transaction. Increasing this through upselling is one of the easiest ways to boost revenue."
                        />
                      </GridLayout>
                    ) : null}
                  </SectionLayout>

                  {/* Product Mix & Team */}
                  <GridLayout columns={2}>
                    <SectionLayout title="Top Sellers" variant="card">
                      {productMixLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Spinner />
                        </div>
                      ) : (
                        <ProductMixTable
                          products={productItems}
                          maxItems={10}
                          showHeader={false}
                        />
                      )}
                    </SectionLayout>

                    <SectionLayout title="Team" variant="card">
                      {teamLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Spinner />
                        </div>
                      ) : (
                        <TeamGrid
                          members={teamMembers}
                          showHeader={false}
                          compact
                        />
                      )}
                    </SectionLayout>
                  </GridLayout>
                </>
              )}
            </div>
          </TabsContent>

          {/* Tab 3: Recipe Costing */}
          <TabsContent value="recipes">
            <div className="space-y-8">
              {/* Unlinked Ingredients Alert */}
              {unlinkedIngredients && unlinkedIngredients.length > 0 && (
                <AlertBanner
                  variant="warning"
                  title="Ingredient Linking Needed"
                  description={`${unlinkedIngredients.length} recipe ingredients need to be linked to master ingredients for accurate cost tracking.`}
                  action={{
                    label: 'Review & Link',
                    onClick: () => setShowLinkingModal(true),
                  }}
                />
              )}

              {/* Ingredient Linking Modal */}
              <IngredientLinkingModal
                open={showLinkingModal}
                onClose={() => setShowLinkingModal(false)}
                unlinkedIngredients={unlinkedIngredients ?? []}
              />

              {/* Recipe Summary Cards */}
              {recipesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : recipeStats && (
                <>
                  <SectionLayout title="Recipe Summary">
                    <GridLayout columns={4}>
                      <MetricCard
                        label="Total Recipes"
                        value={recipeStats.total}
                        info="Number of recipes loaded from your costing spreadsheet."
                      />
                      <MetricCard
                        label="Profitable Items"
                        value={recipeStats.profitable}
                        info="Recipes where the sale price exceeds the cost (positive profit margin)."
                      />
                      <MetricCard
                        label="Needs Attention"
                        value={recipeStats.needsAttention}
                        info="Recipes where the cost exceeds the sale price - these may need price adjustments or ingredient changes."
                      />
                      <MetricCard
                        label="Avg Recipe Cost"
                        value={recipeStats.avgCost}
                        format="currency"
                        info="Average ingredient cost across all recipes."
                      />
                    </GridLayout>
                  </SectionLayout>

                  {/* Recipe List (2-column grid) */}
                  <GridLayout columns={2}>
                    {/* Recipe Profitability Table */}
                    <SectionLayout title="Recipe Profitability" variant="card">
                      <div className="mb-3">
                        <Input
                          placeholder="Search recipes..."
                          value={recipeFilter}
                          onChange={(e) => setRecipeFilter(e.target.value)}
                          inputSize="sm"
                        />
                      </div>
                      <div className="max-h-[500px] overflow-y-auto -mx-6 -mb-6">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-surface-card">
                            <tr className="border-b border-border">
                              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">Recipe</th>
                              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">Batch Cost</th>
                              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">Revenue</th>
                              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">Margin</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRecipes.map((recipe) => (
                              <tr
                                key={recipe.id}
                                onClick={() => setSelectedRecipe(recipe.name)}
                                className={cn(
                                  'border-b border-border cursor-pointer transition-colors',
                                  selectedRecipe === recipe.name
                                    ? 'bg-primary/10'
                                    : 'hover:bg-surface-bg'
                                )}
                              >
                                <td className="py-3 px-4 text-sm">{recipe.name}</td>
                                <td className="py-3 px-4 text-sm text-right">{formatCurrency(recipe.total_cost, { decimals: 2 })}</td>
                                <td className="py-3 px-4 text-sm text-right">{formatCurrency(recipe.revenue_per_batch, { decimals: 2 })}</td>
                                <td className={cn(
                                  'py-3 px-4 text-sm text-right font-medium',
                                  recipe.margin_percent > 0 ? 'text-status-success' : 'text-status-error'
                                )}>
                                  {formatPercent(recipe.margin_percent)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </SectionLayout>

                    {/* Recipe Detail Panel */}
                    <SectionLayout title="Recipe Detail" variant="card">
                      {selectedRecipeData ? (
                        <div className="space-y-4">
                          {isEditingRecipe ? (
                            /* EDIT MODE */
                            <>
                              <div>
                                <h3 className="text-lg font-semibold">{selectedRecipeData.name}</h3>
                                {selectedRecipeData.concept && (
                                  <p className="text-sm text-text-muted">{selectedRecipeData.concept}</p>
                                )}
                              </div>

                              {/* Batch Economics Preview */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-surface-bg p-3 rounded-lg">
                                  <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Batch Cost</p>
                                  <p className="text-xl font-semibold">{formatCurrency(editPreview?.batchCost ?? 0, { decimals: 2 })}</p>
                                  <p className="text-xs text-text-muted">From ingredients (not editable)</p>
                                </div>
                                <div className="bg-surface-bg p-3 rounded-lg">
                                  <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Batch Revenue</p>
                                  <p className="text-xl font-semibold">{formatCurrency(editPreview?.batchRevenue ?? 0, { decimals: 2 })}</p>
                                  <p className="text-xs text-text-muted">Calculated from price × portions</p>
                                </div>
                              </div>

                              <div className={cn(
                                'p-3 rounded-lg flex justify-between items-center',
                                (editPreview?.marginPct ?? 0) >= 0 ? 'bg-status-success/10' : 'bg-status-error/10'
                              )}>
                                <span className="text-sm">Batch Profit</span>
                                <span className={cn(
                                  'text-lg font-semibold',
                                  (editPreview?.marginPct ?? 0) >= 0 ? 'text-status-success' : 'text-status-error'
                                )}>
                                  {formatCurrency(editPreview?.batchProfit ?? 0, { decimals: 2 })} ({formatPercent(editPreview?.marginPct ?? 0)})
                                </span>
                              </div>

                              {/* Editable Fields */}
                              <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Editable Fields</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs text-text-muted mb-1">Portions per batch</label>
                                    <Input
                                      type="number"
                                      value={recipeEditForm.portions}
                                      onChange={(e) => setRecipeEditForm({ ...recipeEditForm, portions: parseInt(e.target.value) || 1 })}
                                      min={1}
                                      inputSize="sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-text-muted mb-1">Price per portion ($)</label>
                                    <Input
                                      type="number"
                                      value={recipeEditForm.proposed_sale_price}
                                      onChange={(e) => setRecipeEditForm({ ...recipeEditForm, proposed_sale_price: parseFloat(e.target.value) || 0 })}
                                      min={0}
                                      step={0.01}
                                      inputSize="sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-text-muted mb-1">Prep Time (minutes)</label>
                                    <Input
                                      type="number"
                                      value={recipeEditForm.prep_time_minutes || ''}
                                      onChange={(e) => setRecipeEditForm({ ...recipeEditForm, prep_time_minutes: parseInt(e.target.value) || 0 })}
                                      min={0}
                                      inputSize="sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-text-muted mb-1">Labor Cost ($)</label>
                                    <Input
                                      type="number"
                                      value={recipeEditForm.cost_in_wages || ''}
                                      onChange={(e) => setRecipeEditForm({ ...recipeEditForm, cost_in_wages: parseFloat(e.target.value) || 0 })}
                                      min={0}
                                      step={0.01}
                                      inputSize="sm"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Save/Cancel Buttons */}
                              <div className="flex gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={saveRecipeEdit}
                                  disabled={updateRecipe.isPending}
                                >
                                  {updateRecipe.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={cancelRecipeEdit}
                                  disabled={updateRecipe.isPending}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            /* VIEW MODE */
                            <>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold">{selectedRecipeData.name}</h3>
                                  {selectedRecipeData.concept && (
                                    <p className="text-sm text-text-muted">{selectedRecipeData.concept}</p>
                                  )}
                                </div>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={startRecipeEdit}
                                >
                                  Edit
                                </Button>
                              </div>

                              {/* Batch Economics */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-surface-bg p-3 rounded-lg">
                                  <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Batch Cost</p>
                                  <p className="text-xl font-semibold">{formatCurrency(selectedRecipeData.total_cost, { decimals: 2 })}</p>
                                  <p className="text-xs text-text-muted">Total ingredient cost</p>
                                </div>
                                <div className="bg-surface-bg p-3 rounded-lg">
                                  <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Batch Revenue</p>
                                  <p className="text-xl font-semibold">{formatCurrency(selectedRecipeData.revenue_per_batch, { decimals: 2 })}</p>
                                  <p className="text-xs text-text-muted">{formatCurrency(selectedRecipeData.price, { decimals: 2 })} × {selectedRecipeData.portions} portions</p>
                                </div>
                              </div>

                              <div className={cn(
                                'p-3 rounded-lg flex justify-between items-center',
                                selectedRecipeData.margin_percent >= 0 ? 'bg-status-success/10' : 'bg-status-error/10'
                              )}>
                                <span className="text-sm">Batch Profit</span>
                                <span className={cn(
                                  'text-lg font-semibold',
                                  selectedRecipeData.margin_percent >= 0 ? 'text-status-success' : 'text-status-error'
                                )}>
                                  {formatCurrency(selectedRecipeData.profit_per_batch, { decimals: 2 })} ({formatPercent(selectedRecipeData.margin_percent)})
                                </span>
                              </div>

                              {/* Recipe Details */}
                              <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2">Recipe Details</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Portions per batch: <strong>{selectedRecipeData.portions}</strong></div>
                                  <div>Price per portion: <strong>{formatCurrency(selectedRecipeData.price, { decimals: 2 })}</strong></div>
                                  <div>Cost per portion: <strong>{formatCurrency(selectedRecipeData.cost_per_portion, { decimals: 2 })}</strong></div>
                                  <div>Prep Time: <strong>{selectedRecipeData.prep_time_minutes ? `${selectedRecipeData.prep_time_minutes} min` : '--'}</strong></div>
                                  <div>Labor Cost: <strong>{selectedRecipeData.cost_in_wages ? formatCurrency(selectedRecipeData.cost_in_wages, { decimals: 2 }) : '--'}</strong></div>
                                </div>
                              </div>

                              {/* Ingredients */}
                              <div>
                                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Ingredients</h4>
                                <div className="space-y-2">
                                  {selectedRecipeData.ingredients.map((ing, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between items-center py-2 border-b border-border last:border-0"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{ing.name}</span>
                                        {!ing.linked && (
                                          <Badge variant="warning" size="sm">Unlinked</Badge>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <span className="text-sm text-text-muted">
                                          {ing.quantity} {ing.unit}
                                        </span>
                                        <span className="text-sm ml-4">{formatCurrency(ing.total_cost ?? 0, { decimals: 2 })}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-text-muted text-center py-12">
                          Select a recipe to view details
                        </div>
                      )}
                    </SectionLayout>
                  </GridLayout>

                  {/* Master Ingredients Section */}
                  <SectionLayout
                    title="Master Ingredients (Costing Sheet)"
                    actions={
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowAddIngredient(!showAddIngredient)}
                      >
                        {showAddIngredient ? 'Cancel' : '+ Add Ingredient'}
                      </Button>
                    }
                  >
                    {/* Add Ingredient Form */}
                    {showAddIngredient && (
                      <div className="bg-surface-card border border-border rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-semibold mb-4">Add New Ingredient</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-text-muted mb-1">Name *</label>
                            <Input
                              value={newIngredient.name}
                              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                              placeholder="Ingredient name"
                              inputSize="sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-text-muted mb-1">Category</label>
                            <Input
                              value={newIngredient.category}
                              onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                              placeholder="Category"
                              inputSize="sm"
                              list="category-list"
                            />
                            <datalist id="category-list">
                              {ingredientCategories?.map((cat) => (
                                <option key={cat} value={cat} />
                              ))}
                            </datalist>
                          </div>
                          <div>
                            <label className="block text-xs text-text-muted mb-1">Unit *</label>
                            <Input
                              value={newIngredient.unit}
                              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                              placeholder="e.g., oz, lb, each"
                              inputSize="sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-text-muted mb-1">Cost per Unit ($)</label>
                            <Input
                              type="number"
                              value={newIngredient.unit_cost || ''}
                              onChange={(e) => setNewIngredient({ ...newIngredient, unit_cost: parseFloat(e.target.value) || 0 })}
                              placeholder="0.00"
                              inputSize="sm"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAddIngredient}
                            disabled={createIngredient.isPending || !newIngredient.name || !newIngredient.unit}
                          >
                            {createIngredient.isPending ? 'Saving...' : 'Save Ingredient'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAddIngredient(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Ingredients Search */}
                    <div className="mb-4">
                      <Input
                        placeholder="Search by name or supplier..."
                        value={ingredientFilter}
                        onChange={(e) => setIngredientFilter(e.target.value)}
                        inputSize="sm"
                      />
                    </div>

                    {/* Ingredients Table */}
                    <div className="bg-surface-card border border-border rounded-lg">
                      <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-surface-card">
                            <tr className="border-b border-border">
                              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">Ingredient</th>
                              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">Category</th>
                              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">Cost</th>
                              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">Units</th>
                              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">Cost/Unit</th>
                              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">Supplier</th>
                              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">Used In</th>
                              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ingredientsLoading ? (
                              <tr>
                                <td colSpan={8} className="py-8 text-center">
                                  <Spinner />
                                </td>
                              </tr>
                            ) : filteredIngredients.map((ingredient) => (
                              editingIngredientId === ingredient.id ? (
                                // EDIT MODE ROW
                                <tr key={ingredient.id} className="border-b border-border bg-primary/5">
                                  <td className="py-2 px-3">
                                    <Input
                                      value={ingredientEditForm.name}
                                      onChange={(e) => setIngredientEditForm({ ...ingredientEditForm, name: e.target.value })}
                                      inputSize="sm"
                                      placeholder="Name"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <Input
                                      value={ingredientEditForm.category}
                                      onChange={(e) => setIngredientEditForm({ ...ingredientEditForm, category: e.target.value })}
                                      inputSize="sm"
                                      placeholder="Category"
                                      list="category-list"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <Input
                                      type="number"
                                      value={ingredientEditForm.cost || ''}
                                      onChange={(e) => setIngredientEditForm({ ...ingredientEditForm, cost: parseFloat(e.target.value) || 0 })}
                                      inputSize="sm"
                                      step="0.01"
                                      className="text-right"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <Input
                                      type="number"
                                      value={ingredientEditForm.units || ''}
                                      onChange={(e) => setIngredientEditForm({ ...ingredientEditForm, units: parseFloat(e.target.value) || 0 })}
                                      inputSize="sm"
                                      step="1"
                                      className="text-right"
                                    />
                                  </td>
                                  <td className="py-2 px-3 text-sm text-right text-text-muted">
                                    {ingredientEditForm.cost && ingredientEditForm.units
                                      ? formatCurrency(ingredientEditForm.cost / ingredientEditForm.units, { decimals: 4 })
                                      : '--'}
                                  </td>
                                  <td className="py-2 px-3">
                                    <Input
                                      value={ingredientEditForm.supplier}
                                      onChange={(e) => setIngredientEditForm({ ...ingredientEditForm, supplier: e.target.value })}
                                      inputSize="sm"
                                      placeholder="Supplier"
                                    />
                                  </td>
                                  <td className="py-2 px-3 text-sm text-text-muted">
                                    {ingredientRecipeMap[ingredient.id]?.length
                                      ? ingredientRecipeMap[ingredient.id].join(', ')
                                      : '-'}
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="flex gap-1 justify-end">
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={saveIngredientEdit}
                                        disabled={updateIngredientMutation.isPending}
                                      >
                                        {updateIngredientMutation.isPending ? 'Saving...' : 'Save'}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={cancelIngredientEdit}
                                        disabled={updateIngredientMutation.isPending}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                // VIEW MODE ROW
                                <tr
                                  key={ingredient.id}
                                  className="border-b border-border hover:bg-surface-bg cursor-pointer"
                                  onClick={() => startIngredientEdit(ingredient)}
                                >
                                  <td className="py-3 px-4 text-sm">{ingredient.name}</td>
                                  <td className="py-3 px-4 text-sm text-text-muted">{ingredient.category || '-'}</td>
                                  <td className="py-3 px-4 text-sm text-right">{ingredient.cost ? formatCurrency(ingredient.cost, { decimals: 2 }) : '-'}</td>
                                  <td className="py-3 px-4 text-sm text-right">{ingredient.units || '-'}</td>
                                  <td className="py-3 px-4 text-sm text-right">{formatCurrency(ingredient.unit_cost, { decimals: 4 })}</td>
                                  <td className="py-3 px-4 text-sm text-text-muted">{ingredient.supplier || '-'}</td>
                                  <td className="py-3 px-4 text-sm text-text-muted">
                                    {ingredientRecipeMap[ingredient.id]?.length
                                      ? ingredientRecipeMap[ingredient.id].join(', ')
                                      : '-'}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <Button
                                      type="button"
                                      variant="danger"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        handleDeleteIngredient(ingredient.id, ingredient.name)
                                      }}
                                      disabled={deleteIngredientMutation.isPending}
                                    >
                                      Delete
                                    </Button>
                                  </td>
                                </tr>
                              )
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </SectionLayout>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
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
