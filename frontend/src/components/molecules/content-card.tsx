import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, cardVariants, type CardProps } from '@/components/ui/card'
import type { VariantProps } from 'class-variance-authority'

/**
 * ContentCard - A molecule combining Card with structured content areas
 *
 * Composed of:
 * - Card (atom) - the container
 * - CardHeader - groups title and description
 * - CardTitle - heading text
 * - CardDescription - muted supporting text
 * - CardContent - main content area
 * - CardFooter - action area
 */

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-text-muted', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// ContentCard - convenience component for common card patterns
export interface ContentCardProps extends VariantProps<typeof cardVariants> {
  title?: string
  description?: string
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  ({ title, description, footer, children, className, ...props }, ref) => (
    <Card ref={ref} className={className} {...props}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  )
)
ContentCard.displayName = 'ContentCard'

// Re-export Card for convenience when using ContentCard pattern
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ContentCard,
  cardVariants,
  type CardProps,
}
