import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { ProductRow, type ProductRowProps } from '@/components/molecules/product-row'
import { formatCurrency } from '@/lib/utils'

export interface ProductMixTableProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  products: Omit<ProductRowProps, 'className'>[]
  showHeader?: boolean
  maxItems?: number
  onViewAll?: () => void
}

const ProductMixTable = React.forwardRef<HTMLDivElement, ProductMixTableProps>(
  (
    {
      className,
      title = 'Top Products',
      products,
      showHeader = true,
      maxItems,
      onViewAll,
      ...props
    },
    ref
  ) => {
    const displayProducts = maxItems ? products.slice(0, maxItems) : products
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0)
    const displayedRevenue = displayProducts.reduce((sum, p) => sum + p.revenue, 0)

    return (
      <Card ref={ref} padding="none" className={cn('overflow-hidden', className)} {...props}>
        {showHeader && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <Text size="lg" weight="semibold">
                {title}
              </Text>
              <Text size="sm" variant="muted">
                {products.length} products · {formatCurrency(totalRevenue)} total
              </Text>
            </div>
            {maxItems && products.length > maxItems && onViewAll && (
              <button
                onClick={onViewAll}
                className="text-sm text-primary hover:underline"
              >
                View all {products.length}
              </button>
            )}
          </div>
        )}

        <div className="px-6 py-2">
          {displayProducts.map((product, index) => (
            <ProductRow
              key={index}
              {...product}
              rank={product.rank ?? index + 1}
              percentOfTotal={
                product.percentOfTotal ??
                (totalRevenue > 0 ? (product.revenue / totalRevenue) * 100 : 0)
              }
            />
          ))}
        </div>

        {maxItems && products.length > maxItems && (
          <div className="px-6 py-3 bg-surface-bg border-t border-border">
            <Text size="sm" variant="muted">
              Showing top {maxItems} of {products.length} products ({formatCurrency(displayedRevenue)} of {formatCurrency(totalRevenue)})
            </Text>
          </div>
        )}
      </Card>
    )
  }
)
ProductMixTable.displayName = 'ProductMixTable'

export { ProductMixTable }
