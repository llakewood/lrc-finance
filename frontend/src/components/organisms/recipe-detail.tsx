import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { StatusDot } from '@/components/ui/status-dot'
import { Button } from '@/components/ui/button'
import { EditableCell } from '@/components/molecules/editable-cell'
import { formatCurrency } from '@/lib/utils'

export interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
  cost: number
  linked?: boolean
}

export interface RecipeDetailProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  category?: string
  portions: number
  price: number
  prepTime?: number
  laborCost?: number
  ingredients: RecipeIngredient[]
  onEdit?: () => void
  onPortionsChange?: (value: string) => void
  onPriceChange?: (value: string) => void
}

const RecipeDetail = React.forwardRef<HTMLDivElement, RecipeDetailProps>(
  (
    {
      className,
      name,
      category,
      portions,
      price,
      prepTime,
      laborCost = 0,
      ingredients,
      onEdit,
      onPortionsChange,
      onPriceChange,
      ...props
    },
    ref
  ) => {
    const ingredientCost = ingredients.reduce((sum, i) => sum + i.cost, 0)
    const totalCost = ingredientCost + laborCost
    const revenuePerBatch = price * portions
    const profitPerBatch = revenuePerBatch - totalCost
    const margin = revenuePerBatch > 0 ? (profitPerBatch / revenuePerBatch) * 100 : 0
    const costPerPortion = portions > 0 ? totalCost / portions : 0

    const unlinkedCount = ingredients.filter((i) => i.linked === false).length

    return (
      <Card ref={ref} className={cn('', className)} {...props}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Text size="xl" weight="bold">
                {name}
              </Text>
              {unlinkedCount > 0 && (
                <Badge variant="warning" size="sm">
                  {unlinkedCount} unlinked
                </Badge>
              )}
            </div>
            {category && (
              <Text size="sm" variant="muted">
                {category}
              </Text>
            )}
          </div>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit Recipe
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-surface-bg rounded-lg mb-6">
          <div>
            <Text size="xs" variant="muted">
              Portions
            </Text>
            <EditableCell
              value={portions}
              type="number"
              onSave={onPortionsChange}
              editable={!!onPortionsChange}
            />
          </div>
          <div>
            <Text size="xs" variant="muted">
              Price
            </Text>
            <EditableCell
              value={price}
              type="number"
              format={(v) => formatCurrency(Number(v), { decimals: 2 })}
              onSave={onPriceChange}
              editable={!!onPriceChange}
            />
          </div>
          <div>
            <Text size="xs" variant="muted">
              Cost/Portion
            </Text>
            <Text size="sm" weight="semibold">
              {formatCurrency(costPerPortion, { decimals: 2 })}
            </Text>
          </div>
          <div>
            <Text size="xs" variant="muted">
              Margin
            </Text>
            <Text
              size="sm"
              weight="semibold"
              variant={margin >= 70 ? 'success' : margin >= 50 ? 'warning' : 'danger'}
            >
              {margin.toFixed(1)}%
            </Text>
          </div>
        </div>

        {/* Profitability */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 border border-border rounded-lg">
            <Text size="xs" variant="muted">
              Batch Cost
            </Text>
            <Text size="lg" weight="bold">
              {formatCurrency(totalCost, { decimals: 2 })}
            </Text>
          </div>
          <div className="p-3 border border-border rounded-lg">
            <Text size="xs" variant="muted">
              Batch Revenue
            </Text>
            <Text size="lg" weight="bold">
              {formatCurrency(revenuePerBatch, { decimals: 2 })}
            </Text>
          </div>
          <div className="p-3 border border-success/20 bg-success/5 rounded-lg">
            <Text size="xs" variant="muted">
              Batch Profit
            </Text>
            <Text size="lg" weight="bold" variant="success">
              {formatCurrency(profitPerBatch, { decimals: 2 })}
            </Text>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <Text size="sm" weight="semibold" className="mb-3">
            Ingredients ({ingredients.length})
          </Text>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-bg text-left">
                  <th className="px-3 py-2 text-xs font-semibold text-text-muted">Ingredient</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-muted text-right">Qty</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-muted text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <StatusDot
                          variant={ingredient.linked !== false ? 'linked' : 'unlinked'}
                          size="sm"
                        />
                        <Text size="sm">{ingredient.name}</Text>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Text size="sm" variant="muted">
                        {ingredient.quantity} {ingredient.unit}
                      </Text>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Text size="sm" weight="medium">
                        {formatCurrency(ingredient.cost, { decimals: 2 })}
                      </Text>
                    </td>
                  </tr>
                ))}
                {laborCost > 0 && (
                  <tr className="border-t border-border bg-surface-bg/50">
                    <td className="px-3 py-2">
                      <Text size="sm" variant="muted">
                        Labor ({prepTime} min)
                      </Text>
                    </td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2 text-right">
                      <Text size="sm" weight="medium">
                        {formatCurrency(laborCost, { decimals: 2 })}
                      </Text>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-surface-bg">
                  <td className="px-3 py-2">
                    <Text size="sm" weight="semibold">
                      Total
                    </Text>
                  </td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right">
                    <Text size="sm" weight="bold">
                      {formatCurrency(totalCost, { decimals: 2 })}
                    </Text>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Card>
    )
  }
)
RecipeDetail.displayName = 'RecipeDetail'

export { RecipeDetail }
