import * as React from 'react'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export interface ProductRowProps extends React.HTMLAttributes<HTMLDivElement> {
  rank?: number
  name: string
  category?: string
  revenue: number
  quantity?: number
  percentOfTotal?: number
  showRank?: boolean
}

const ProductRow = React.forwardRef<HTMLDivElement, ProductRowProps>(
  (
    {
      className,
      rank,
      name,
      category,
      revenue,
      quantity,
      percentOfTotal,
      showRank = true,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-4 py-3 border-b border-border last:border-b-0',
          className
        )}
        {...props}
      >
        {/* Rank */}
        {showRank && rank !== undefined && (
          <div className="w-8 flex-shrink-0">
            <Text
              size="sm"
              weight="bold"
              variant={rank <= 3 ? 'primary' : 'muted'}
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center',
                rank <= 3 ? 'bg-primary/10' : 'bg-surface-bg'
              )}
            >
              {rank}
            </Text>
          </div>
        )}

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <Text size="sm" weight="medium" className="truncate">
            {name}
          </Text>
          {category && (
            <Text size="xs" variant="muted" className="truncate">
              {category}
            </Text>
          )}
        </div>

        {/* Quantity */}
        {quantity !== undefined && (
          <div className="text-right flex-shrink-0">
            <Text size="sm" variant="muted">
              {quantity.toLocaleString()} sold
            </Text>
          </div>
        )}

        {/* Revenue */}
        <div className="text-right flex-shrink-0 min-w-[80px]">
          <Text size="sm" weight="semibold">
            {formatCurrency(revenue)}
          </Text>
          {percentOfTotal !== undefined && (
            <Badge variant="default" size="sm" className="mt-1">
              {percentOfTotal.toFixed(1)}%
            </Badge>
          )}
        </div>
      </div>
    )
  }
)
ProductRow.displayName = 'ProductRow'

export { ProductRow }
