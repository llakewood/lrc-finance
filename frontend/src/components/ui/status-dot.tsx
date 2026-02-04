import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusDotVariants = cva('rounded-full inline-block', {
  variants: {
    variant: {
      default: 'bg-text-muted',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      linked: 'bg-success',
      unlinked: 'bg-warning',
      live: 'bg-success',
    },
    size: {
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
    },
    pulse: {
      true: 'animate-pulse',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    pulse: false,
  },
})

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {}

const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, variant, size, pulse, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(statusDotVariants({ variant, size, pulse, className }))}
        {...props}
      />
    )
  }
)
StatusDot.displayName = 'StatusDot'

export { StatusDot, statusDotVariants }
