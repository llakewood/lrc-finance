import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-transparent text-text-muted hover:bg-surface-bg hover:text-text-default',
        ghost: 'bg-transparent text-text-muted hover:bg-surface-bg',
        primary: 'bg-primary text-white hover:bg-primary-light focus:ring-primary',
        danger: 'bg-transparent text-text-muted hover:bg-danger/10 hover:text-danger',
      },
      size: {
        sm: 'h-7 w-7',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode
  loading?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, loading, disabled, ...props }, ref) => {
    const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm'

    return (
      <button
        ref={ref}
        className={cn(iconButtonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Spinner size={spinnerSize} variant={variant === 'primary' ? 'white' : 'default'} />
        ) : (
          icon
        )}
      </button>
    )
  }
)
IconButton.displayName = 'IconButton'

export { IconButton, iconButtonVariants }
