/**
 * Menu Verification Component
 * Compares recipe prices against Square catalog to identify discrepancies
 */

import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { useMenuVerification, useRefreshMenuVerification } from '@/hooks/use-menu-verification'
import type { MenuMatch, UnmatchedRecipe } from '@/lib/api-types'

const CheckIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const AlertIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

interface PriceMismatchRowProps {
  match: MenuMatch
}

function PriceMismatchRow({ match }: PriceMismatchRowProps) {
  const priceDiff = match.recipe_price - match.square_price
  const isOverpriced = priceDiff < 0 // Square price is higher than recipe

  return (
    <tr className="border-b border-border hover:bg-surface-bg/50">
      <td className="py-3 px-4">
        <div className="flex flex-col">
          <Text size="sm" weight="medium">{match.recipe_name}</Text>
          <Text size="xs" className="text-text-muted">
            Square: {match.square_item_name}
          </Text>
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <Text size="sm" weight="medium">{formatCurrency(match.recipe_price)}</Text>
      </td>
      <td className="py-3 px-4 text-right">
        <Text size="sm" className={isOverpriced ? 'text-status-warning' : 'text-status-error'}>
          {formatCurrency(match.square_price)}
        </Text>
      </td>
      <td className="py-3 px-4 text-right">
        <Badge variant={isOverpriced ? 'warning' : 'danger'} size="sm">
          {priceDiff > 0 ? '+' : ''}{formatCurrency(priceDiff)}
        </Badge>
      </td>
      <td className="py-3 px-4 text-right">
        <Text size="xs" className="text-text-muted">
          {formatPercent(match.match_confidence * 100)}
        </Text>
      </td>
    </tr>
  )
}

interface UnmatchedRowProps {
  recipe: UnmatchedRecipe
}

function UnmatchedRow({ recipe }: UnmatchedRowProps) {
  return (
    <tr className="border-b border-border hover:bg-surface-bg/50">
      <td className="py-3 px-4">
        <Text size="sm" weight="medium">{recipe.name}</Text>
      </td>
      <td className="py-3 px-4">
        <Text size="sm" className="text-text-muted">{recipe.category || '-'}</Text>
      </td>
      <td className="py-3 px-4 text-right">
        {recipe.proposed_sale_price ? (
          <Text size="sm">{formatCurrency(recipe.proposed_sale_price)}</Text>
        ) : (
          <Text size="sm" className="text-text-muted">No price</Text>
        )}
      </td>
      <td className="py-3 px-4">
        <Text size="xs" className="text-text-muted">{recipe.reason}</Text>
      </td>
    </tr>
  )
}

export interface MenuVerificationProps {
  className?: string
}

export function MenuVerification({ className }: MenuVerificationProps) {
  const { data, isLoading, error } = useMenuVerification()
  const refreshMutation = useRefreshMenuVerification()

  const handleRefresh = () => {
    refreshMutation.mutate()
  }

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertIcon />
          <Text size="sm" className="text-status-error mt-2">
            Failed to verify menu: {error.message}
          </Text>
          <Button variant="ghost" size="sm" className="mt-4" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const { summary, price_mismatches, unmatched_recipes, all_matches } = data
  const allPricesMatch = price_mismatches.length === 0
  const matchedRecipes = all_matches.filter(m => m.price_matches)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card padding="md" className="text-center">
          <Text size="2xl" weight="bold">{summary.recipes_count}</Text>
          <Text size="sm" className="text-text-muted">Total Recipes</Text>
        </Card>
        <Card padding="md" className="text-center">
          <Text size="2xl" weight="bold" className="text-status-success">
            {matchedRecipes.length}
          </Text>
          <Text size="sm" className="text-text-muted">Prices Match</Text>
        </Card>
        <Card padding="md" className="text-center">
          <Text size="2xl" weight="bold" className={price_mismatches.length > 0 ? 'text-status-error' : ''}>
            {price_mismatches.length}
          </Text>
          <Text size="sm" className="text-text-muted">Price Mismatches</Text>
        </Card>
        <Card padding="md" className="text-center">
          <Text size="2xl" weight="bold" className="text-text-muted">
            {unmatched_recipes.length}
          </Text>
          <Text size="sm" className="text-text-muted">Not in Square</Text>
        </Card>
      </div>

      {/* Status Banner */}
      <Card
        padding="md"
        className={cn(
          'flex items-center justify-between',
          allPricesMatch
            ? 'bg-status-success/10 border-status-success/20'
            : 'bg-status-error/10 border-status-error/20'
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-full',
            allPricesMatch ? 'bg-status-success/20 text-status-success' : 'bg-status-error/20 text-status-error'
          )}>
            {allPricesMatch ? <CheckIcon /> : <AlertIcon />}
          </div>
          <div>
            <Text size="sm" weight="semibold">
              {allPricesMatch
                ? 'All prices are in sync!'
                : `${price_mismatches.length} price${price_mismatches.length > 1 ? 's' : ''} need updating in Square`
              }
            </Text>
            <Text size="xs" className="text-text-muted">
              {allPricesMatch
                ? 'Your recipe prices match your Square catalog.'
                : 'Update these items in Square POS to match your costing.'
              }
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
        >
          {refreshMutation.isPending ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <RefreshIcon />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </Card>

      {/* Cache Info */}
      {data._cache && (
        <Text size="xs" className="text-text-muted">
          {data._cache.stale && 'Using cached data (offline). '}
          Last checked: {new Date(data._cache.cached_at).toLocaleString()}
        </Text>
      )}

      {/* Price Mismatches Table */}
      {price_mismatches.length > 0 && (
        <Card padding="none">
          <div className="p-4 border-b border-border">
            <Text size="sm" weight="semibold">Price Mismatches</Text>
            <Text size="xs" className="text-text-muted">
              These items have different prices in Square than your recipes.
              Update Square to match the "Our Price" column.
            </Text>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-bg/50">
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                    Recipe
                  </th>
                  <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                    Our Price
                  </th>
                  <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                    Square Price
                  </th>
                  <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                    Difference
                  </th>
                  <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                    Match
                  </th>
                </tr>
              </thead>
              <tbody>
                {price_mismatches.map((match) => (
                  <PriceMismatchRow key={match.recipe_id} match={match} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Unmatched Recipes Table */}
      {unmatched_recipes.length > 0 && (
        <Card padding="none">
          <div className="p-4 border-b border-border">
            <Text size="sm" weight="semibold">Recipes Not in Square</Text>
            <Text size="xs" className="text-text-muted">
              These recipes couldn't be matched to items in your Square catalog.
            </Text>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-bg/50">
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                    Recipe
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                    Category
                  </th>
                  <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                    Price
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {unmatched_recipes.map((recipe) => (
                  <UnmatchedRow key={recipe.id} recipe={recipe} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* All Matched (Collapsible) */}
      {matchedRecipes.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none">
            <Card padding="md" className="flex items-center justify-between hover:bg-surface-bg/50">
              <div className="flex items-center gap-2">
                <Text size="sm" weight="medium">View All Matched Items</Text>
                <Badge variant="default" size="sm">{matchedRecipes.length}</Badge>
              </div>
              <svg
                className="h-5 w-5 text-text-muted transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Card>
          </summary>
          <Card padding="none" className="mt-2">
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full">
                <thead className="bg-surface-bg/50 sticky top-0">
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                      Recipe
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                      Square Item
                    </th>
                    <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                      Price
                    </th>
                    <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wide py-3 px-4">
                      Match
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matchedRecipes.map((match) => (
                    <tr key={match.recipe_id} className="border-b border-border">
                      <td className="py-3 px-4">
                        <Text size="sm">{match.recipe_name}</Text>
                      </td>
                      <td className="py-3 px-4">
                        <Text size="sm" className="text-text-muted">{match.square_item_name}</Text>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Text size="sm">{formatCurrency(match.recipe_price)}</Text>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="success" size="sm">
                          {formatPercent(match.match_confidence * 100)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </details>
      )}
    </div>
  )
}

export default MenuVerification
