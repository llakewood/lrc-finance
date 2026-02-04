import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const tooltipVariants = cva(
  'absolute z-50 px-2 py-1 text-xs rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-text-default text-white',
        light: 'bg-surface-card text-text-default border border-border',
      },
      position: {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'top',
    },
  }
)

export interface TooltipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tooltipVariants> {
  content: React.ReactNode
  children: React.ReactNode
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, variant, position, content, children, ...props }, ref) => {
    return (
      <div ref={ref} className="relative inline-flex group" {...props}>
        {children}
        <div className={cn(tooltipVariants({ variant, position, className }))}>
          {content}
        </div>
      </div>
    )
  }
)
Tooltip.displayName = 'Tooltip'

export { Tooltip, tooltipVariants }
