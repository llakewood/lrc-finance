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

const modalOverlayVariants = cva(
  'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4',
  {
    variants: {
      animation: {
        fade: 'animate-in fade-in duration-200',
        none: '',
      },
    },
    defaultVariants: {
      animation: 'fade',
    },
  }
)

const modalContentVariants = cva(
  'relative bg-surface-card rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col',
  {
    variants: {
      size: {
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-xl',
        full: 'w-full max-w-4xl',
      },
      animation: {
        fade: 'animate-in fade-in zoom-in-95 duration-200',
        none: '',
      },
    },
    defaultVariants: {
      size: 'md',
      animation: 'fade',
    },
  }
)

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalContentVariants> {
  open?: boolean
  onClose?: () => void
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      size,
      animation,
      open = false,
      onClose,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      children,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      if (!closeOnEscape || !open) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose?.()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [closeOnEscape, open, onClose])

    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
      return () => {
        document.body.style.overflow = ''
      }
    }, [open])

    if (!open) return null

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose?.()
      }
    }

    return (
      <div
        className={cn(modalOverlayVariants({ animation }))}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
      >
        <div
          ref={ref}
          className={cn(modalContentVariants({ size, animation }), className)}
          {...props}
        >
          {children}
        </div>
      </div>
    )
  }
)
Modal.displayName = 'Modal'

const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }
>(({ className, onClose, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-between px-6 py-4 border-b border-border',
      className
    )}
    {...props}
  >
    <div className="flex-1">{children}</div>
    {onClose && (
      <IconButton
        icon={<CloseIcon />}
        variant="ghost"
        size="sm"
        title="Close"
        onClick={onClose}
      />
    )}
  </div>
))
ModalHeader.displayName = 'ModalHeader'

const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    as="h2"
    size="lg"
    weight="semibold"
    className={cn('', className)}
    {...props}
  />
))
ModalTitle.displayName = 'ModalTitle'

const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    size="sm"
    variant="muted"
    className={cn('mt-1', className)}
    {...props}
  />
))
ModalDescription.displayName = 'ModalDescription'

const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto px-6 py-4', className)}
    {...props}
  />
))
ModalBody.displayName = 'ModalBody'

const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-surface-bg',
      className
    )}
    {...props}
  />
))
ModalFooter.displayName = 'ModalFooter'

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  modalOverlayVariants,
  modalContentVariants,
}
