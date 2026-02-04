import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { IconButton } from '@/components/ui/icon-button'

const CloseIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const SuccessIcon = () => (
  <svg className="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ErrorIcon = () => (
  <svg className="h-5 w-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const WarningIcon = () => (
  <svg className="h-5 w-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const InfoIcon = () => (
  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const toastVariants = cva(
  'flex items-start gap-3 w-full max-w-sm p-4 rounded-lg shadow-lg border pointer-events-auto',
  {
    variants: {
      variant: {
        default: 'bg-surface-card border-border',
        success: 'bg-success/10 border-success/20',
        error: 'bg-danger/10 border-danger/20',
        warning: 'bg-warning/10 border-warning/20',
        info: 'bg-primary/10 border-primary/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string
  description?: string
  onClose?: () => void
  duration?: number
  showIcon?: boolean
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant = 'default',
      title,
      description,
      onClose,
      duration = 5000,
      showIcon = true,
      children,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      if (duration && onClose) {
        const timer = setTimeout(onClose, duration)
        return () => clearTimeout(timer)
      }
    }, [duration, onClose])

    const Icon = React.useMemo(() => {
      switch (variant) {
        case 'success':
          return SuccessIcon
        case 'error':
          return ErrorIcon
        case 'warning':
          return WarningIcon
        case 'info':
          return InfoIcon
        default:
          return null
      }
    }, [variant])

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        {showIcon && Icon && (
          <div className="flex-shrink-0">
            <Icon />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <Text size="sm" weight="semibold">
              {title}
            </Text>
          )}
          {description && (
            <Text size="sm" variant="muted" className={title ? 'mt-1' : ''}>
              {description}
            </Text>
          )}
          {children}
        </div>
        {onClose && (
          <IconButton
            icon={<CloseIcon />}
            variant="ghost"
            size="sm"
            title="Dismiss"
            onClick={onClose}
            className="flex-shrink-0 -mr-1 -mt-1"
          />
        )}
      </div>
    )
  }
)
Toast.displayName = 'Toast'

// Toast container for positioning toasts
const toastContainerVariants = cva('fixed z-50 flex flex-col gap-2 pointer-events-none', {
  variants: {
    position: {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'top-center': 'top-4 left-1/2 -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    },
  },
  defaultVariants: {
    position: 'top-right',
  },
})

export interface ToastContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastContainerVariants> {}

const ToastContainer = React.forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ className, position, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(toastContainerVariants({ position }), className)}
      {...props}
    />
  )
)
ToastContainer.displayName = 'ToastContainer'

export { Toast, ToastContainer, toastVariants, toastContainerVariants }
