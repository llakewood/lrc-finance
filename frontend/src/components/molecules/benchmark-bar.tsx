import * as React from 'react'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { Tooltip } from '@/components/ui/tooltip'
import { formatPercent } from '@/lib/utils'

export interface BenchmarkBarProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: number
  min: number
  max: number
  industryLow?: number
  industryHigh?: number
  format?: 'percent' | 'number'
  info?: string
}

const BenchmarkBar = React.forwardRef<HTMLDivElement, BenchmarkBarProps>(
  (
    {
      className,
      label,
      value,
      min,
      max,
      industryLow,
      industryHigh,
      format = 'percent',
      info,
      ...props
    },
    ref
  ) => {
    const range = max - min
    const valuePosition = ((value - min) / range) * 100
    const clampedPosition = Math.min(Math.max(valuePosition, 0), 100)

    const industryLowPosition = industryLow !== undefined ? ((industryLow - min) / range) * 100 : undefined
    const industryHighPosition = industryHigh !== undefined ? ((industryHigh - min) / range) * 100 : undefined

    const formattedValue = format === 'percent' ? formatPercent(value, 1) : value.toLocaleString()

    const isInRange =
      industryLow !== undefined && industryHigh !== undefined
        ? value >= industryLow && value <= industryHigh
        : true

    return (
      <div ref={ref} className={cn('', className)} {...props}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Text size="sm" weight="medium">
              {label}
            </Text>
            {info && (
              <Tooltip content={info} position="top">
                <span className="text-text-muted cursor-help text-xs">ⓘ</span>
              </Tooltip>
            )}
          </div>
          <Text
            size="sm"
            weight="semibold"
            variant={isInRange ? 'success' : 'warning'}
          >
            {formattedValue}
          </Text>
        </div>

        <div className="relative h-2 bg-border rounded-full">
          {/* Industry range highlight */}
          {industryLowPosition !== undefined && industryHighPosition !== undefined && (
            <div
              className="absolute h-full bg-success/20 rounded-full"
              style={{
                left: `${industryLowPosition}%`,
                width: `${industryHighPosition - industryLowPosition}%`,
              }}
            />
          )}

          {/* Value marker */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow',
              isInRange ? 'bg-success' : 'bg-warning'
            )}
            style={{ left: `calc(${clampedPosition}% - 6px)` }}
          />
        </div>

        {/* Range labels */}
        <div className="flex justify-between mt-1">
          <Text size="xs" variant="muted">
            {format === 'percent' ? formatPercent(min, 0) : min}
          </Text>
          {industryLow !== undefined && industryHigh !== undefined && (
            <Text size="xs" variant="muted">
              Industry: {format === 'percent' ? formatPercent(industryLow, 0) : industryLow}-
              {format === 'percent' ? formatPercent(industryHigh, 0) : industryHigh}
            </Text>
          )}
          <Text size="xs" variant="muted">
            {format === 'percent' ? formatPercent(max, 0) : max}
          </Text>
        </div>
      </div>
    )
  }
)
BenchmarkBar.displayName = 'BenchmarkBar'

export { BenchmarkBar }
