import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const progressBarContainerVariants = cva('w-full rounded-full overflow-hidden', {
  variants: {
    size: {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    },
    variant: {
      default: 'bg-border',
      muted: 'bg-surface-bg',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

const progressBarFillVariants = cva('h-full rounded-full transition-all duration-300', {
  variants: {
    color: {
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
    },
  },
  defaultVariants: {
    color: 'primary',
  },
})

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarContainerVariants>,
    VariantProps<typeof progressBarFillVariants> {
  value: number
  max?: number
  showLabel?: boolean
  labelFormat?: 'percent' | 'value' | 'fraction'
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      size,
      variant,
      color,
      value,
      max = 100,
      showLabel = false,
      labelFormat = 'percent',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const label = React.useMemo(() => {
      switch (labelFormat) {
        case 'percent':
          return `${Math.round(percentage)}%`
        case 'value':
          return value.toLocaleString()
        case 'fraction':
          return `${value.toLocaleString()} / ${max.toLocaleString()}`
        default:
          return `${Math.round(percentage)}%`
      }
    }, [labelFormat, percentage, value, max])

    return (
      <div ref={ref} className={cn('flex items-center gap-3', className)} {...props}>
        <div className={cn(progressBarContainerVariants({ size, variant }), 'flex-1')}>
          <div
            className={cn(progressBarFillVariants({ color }))}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
        {showLabel && (
          <span className="text-sm text-text-muted min-w-[3rem] text-right">{label}</span>
        )}
      </div>
    )
  }
)
ProgressBar.displayName = 'ProgressBar'

export { ProgressBar, progressBarContainerVariants, progressBarFillVariants }
