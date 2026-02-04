import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'

const CloseIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const InfoIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const WarningIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const SuccessIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ErrorIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const alertBannerVariants = cva(
  'flex items-start gap-3 p-4 rounded-lg border',
  {
    variants: {
      variant: {
        info: 'bg-primary/5 border-primary/20 text-primary',
        warning: 'bg-warning/10 border-warning/20 text-warning',
        success: 'bg-success/10 border-success/20 text-success',
        error: 'bg-danger/10 border-danger/20 text-danger',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBannerVariants> {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
  showIcon?: boolean
}

const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  (
    {
      className,
      variant = 'info',
      title,
      description,
      action,
      onDismiss,
      showIcon = true,
      children,
      ...props
    },
    ref
  ) => {
    const Icon = React.useMemo(() => {
      switch (variant) {
        case 'warning':
          return WarningIcon
        case 'success':
          return SuccessIcon
        case 'error':
          return ErrorIcon
        default:
          return InfoIcon
      }
    }, [variant])

    const buttonVariant = React.useMemo(() => {
      switch (variant) {
        case 'warning':
          return 'warning'
        case 'success':
          return 'success'
        case 'error':
          return 'danger'
        default:
          return 'primary'
      }
    }, [variant])

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertBannerVariants({ variant }), className)}
        {...props}
      >
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            <Icon />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <Text size="sm" weight="semibold" className="text-current">
              {title}
            </Text>
          )}
          {description && (
            <Text size="sm" className={cn('text-current opacity-90', title && 'mt-1')}>
              {description}
            </Text>
          )}
          {children}
          {action && (
            <Button
              variant={buttonVariant}
              size="sm"
              onClick={action.onClick}
              className="mt-3"
            >
              {action.label}
            </Button>
          )}
        </div>
        {onDismiss && (
          <IconButton
            icon={<CloseIcon />}
            variant="ghost"
            size="sm"
            title="Dismiss"
            onClick={onDismiss}
            className="flex-shrink-0 -mr-1 -mt-1 text-current opacity-70 hover:opacity-100"
          />
        )}
      </div>
    )
  }
)
AlertBanner.displayName = 'AlertBanner'

export { AlertBanner, alertBannerVariants }
