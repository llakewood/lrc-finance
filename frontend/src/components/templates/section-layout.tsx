import * as React from 'react'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { Card } from '@/components/ui/card'

export interface SectionLayoutProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  variant?: 'default' | 'card'
}

const SectionLayout = React.forwardRef<HTMLElement, SectionLayoutProps>(
  ({ className, title, description, actions, children, variant = 'default', ...props }, ref) => {
    const content = (
      <>
        <div className="flex items-start justify-between mb-4">
          <div>
            <Text as="h2" size="lg" weight="semibold">
              {title}
            </Text>
            {description && (
              <Text size="sm" variant="muted" className="mt-1">
                {description}
              </Text>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {children}
      </>
    )

    if (variant === 'card') {
      return (
        <section ref={ref} className={cn('', className)} {...props}>
          <Card>{content}</Card>
        </section>
      )
    }

    return (
      <section ref={ref} className={cn('', className)} {...props}>
        {content}
      </section>
    )
  }
)
SectionLayout.displayName = 'SectionLayout'

export { SectionLayout }
