import * as React from 'react'
import { cn } from '@/lib/utils'

export interface GridLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const GridLayout = React.forwardRef<HTMLDivElement, GridLayoutProps>(
  ({ className, columns = 2, gap = 'md', children, ...props }, ref) => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 lg:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    }

    const gapSize = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    }

    return (
      <div
        ref={ref}
        className={cn('grid', gridCols[columns], gapSize[gap], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GridLayout.displayName = 'GridLayout'

export { GridLayout }
