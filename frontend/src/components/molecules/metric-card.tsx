import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, type CardProps } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { formatCurrency, formatPercent } from '@/lib/utils'

export interface MetricCardProps extends Omit<CardProps, 'children'> {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  format?: 'currency' | 'percent' | 'number' | 'none'
  decimals?: number
  info?: string
  trend?: 'up' | 'down' | 'neutral'
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      className,
      label,
      value,
      change,
      changeLabel,
      format = 'none',
      decimals = 0,
      info,
      trend,
      ...props
    },
    ref
  ) => {
    const formattedValue = React.useMemo(() => {
      if (typeof value === 'string') return value
      switch (format) {
        case 'currency':
          return formatCurrency(value, { decimals })
        case 'percent':
          return formatPercent(value, decimals)
        case 'number':
          return value.toLocaleString('en-CA', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        default:
          return String(value)
      }
    }, [value, format, decimals])

    const determinedTrend = trend ?? (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : undefined)

    const changeVariant = determinedTrend === 'up' ? 'success' : determinedTrend === 'down' ? 'danger' : 'default'

    return (
      <Card ref={ref} className={cn('', className)} {...props}>
        <div className="flex items-start justify-between">
          <Text size="sm" variant="muted">
            {label}
          </Text>
          {info && (
            <Tooltip content={info} position="top">
              <span className="text-text-muted cursor-help text-sm">ⓘ</span>
            </Tooltip>
          )}
        </div>
        <Text size="2xl" weight="bold" className="mt-1">
          {formattedValue}
        </Text>
        {change !== undefined && (
          <div className="mt-2">
            <Badge variant={changeVariant} size="sm">
              {change > 0 ? '+' : ''}
              {formatPercent(change, 1)}
            </Badge>
            {changeLabel && (
              <Text as="span" size="xs" variant="muted" className="ml-2">
                {changeLabel}
              </Text>
            )}
          </div>
        )}
      </Card>
    )
  }
)
MetricCard.displayName = 'MetricCard'

export { MetricCard }
