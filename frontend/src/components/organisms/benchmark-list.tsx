import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { BenchmarkBar, type BenchmarkBarProps } from '@/components/molecules/benchmark-bar'

export interface BenchmarkListProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  benchmarks: Omit<BenchmarkBarProps, 'className'>[]
}

const BenchmarkList = React.forwardRef<HTMLDivElement, BenchmarkListProps>(
  ({ className, title, description, benchmarks, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn('', className)} {...props}>
        {(title || description) && (
          <div className="mb-6">
            {title && (
              <Text size="lg" weight="semibold">
                {title}
              </Text>
            )}
            {description && (
              <Text size="sm" variant="muted" className="mt-1">
                {description}
              </Text>
            )}
          </div>
        )}
        <div className="space-y-6">
          {benchmarks.map((benchmark, index) => (
            <BenchmarkBar key={index} {...benchmark} />
          ))}
        </div>
      </Card>
    )
  }
)
BenchmarkList.displayName = 'BenchmarkList'

export { BenchmarkList }
