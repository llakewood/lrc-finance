import * as React from 'react'
import { cn } from '@/lib/utils'
import { MetricCard, type MetricCardProps } from '@/components/molecules/metric-card'

export interface MetricGridProps extends React.HTMLAttributes<HTMLDivElement> {
  metrics: MetricCardProps[]
  columns?: 2 | 3 | 4
}

const MetricGrid = React.forwardRef<HTMLDivElement, MetricGridProps>(
  ({ className, metrics, columns = 4, ...props }, ref) => {
    const gridCols = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    }

    return (
      <div
        ref={ref}
        className={cn('grid gap-4', gridCols[columns], className)}
        {...props}
      >
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    )
  }
)
MetricGrid.displayName = 'MetricGrid'

export { MetricGrid }
