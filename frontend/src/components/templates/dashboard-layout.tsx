import * as React from 'react'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { StatusDot } from '@/components/ui/status-dot'

// Coffee cup logo
const Logo = () => (
  <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
    <path d="M6 10h16v14a4 4 0 01-4 4h-8a4 4 0 01-4-4V10z" fill="currentColor" />
    <path d="M22 12h2a3 3 0 010 6h-2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M10 6c0-2 2-2 2-4M14 7c0-2 2-2 2-4M18 6c0-2 2-2 2-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <ellipse cx="14" cy="12" rx="6" ry="1.5" fill="currentColor" opacity="0.6" />
  </svg>
)

export interface DashboardLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  liveData?: boolean
  lastUpdated?: string
  headerActions?: React.ReactNode
  children: React.ReactNode
}

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  (
    {
      className,
      title = 'Little Red Coffee',
      subtitle = 'Financial Dashboard',
      liveData = false,
      lastUpdated,
      headerActions,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('min-h-screen bg-surface-bg', className)}
        {...props}
      >
        {/* Header */}
        <header className="bg-surface-card border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                <div className="text-primary">
                  <Logo />
                </div>
                <div>
                  <Text size="lg" weight="bold" className="text-primary leading-none">
                    {title}
                  </Text>
                  <Text size="xs" variant="muted">
                    {subtitle}
                  </Text>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-4">
                {liveData && (
                  <div className="flex items-center gap-2">
                    <StatusDot variant="live" pulse />
                    <Text size="sm" variant="muted">
                      Live Data
                    </Text>
                  </div>
                )}
                {lastUpdated && (
                  <Text size="xs" variant="muted">
                    Updated {lastUpdated}
                  </Text>
                )}
                {headerActions}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between text-sm text-text-muted">
              <Text size="xs" variant="muted">
                © {new Date().getFullYear()} Little Red Coffee
              </Text>
              <Text size="xs" variant="muted">
                Built with React + TypeScript
              </Text>
            </div>
          </div>
        </footer>
      </div>
    )
  }
)
DashboardLayout.displayName = 'DashboardLayout'

export { DashboardLayout }
