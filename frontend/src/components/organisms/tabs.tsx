import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const tabsListVariants = cva('flex', {
  variants: {
    variant: {
      default: 'border-b border-border',
      pills: 'gap-2 p-1 bg-surface-bg rounded-lg',
      underline: 'gap-4',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'px-4 py-2 -mb-px border-b-2 border-transparent',
          'text-text-muted hover:text-text-default',
          'data-[state=active]:border-primary data-[state=active]:text-primary',
        ],
        pills: [
          'px-3 py-1.5 rounded-md text-sm',
          'text-text-muted hover:text-text-default hover:bg-surface-card',
          'data-[state=active]:bg-surface-card data-[state=active]:text-text-default data-[state=active]:shadow-sm',
        ],
        underline: [
          'pb-2 border-b-2 border-transparent',
          'text-text-muted hover:text-text-default',
          'data-[state=active]:border-primary data-[state=active]:text-primary',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  variant: 'default' | 'pills' | 'underline'
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

export interface TabsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, variant = 'default', value, defaultValue, onValueChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '')
    const currentValue = value ?? internalValue

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        setInternalValue(newValue)
        onValueChange?.(newValue)
      },
      [onValueChange]
    )

    return (
      <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, variant: variant ?? 'default' }}>
        <div ref={ref} className={cn('', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = 'Tabs'

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { variant } = useTabsContext()
    return (
      <div
        ref={ref}
        role="tablist"
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
TabsList.displayName = 'TabsList'

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  badge?: number | string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, badge, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange, variant } = useTabsContext()
    const isActive = selectedValue === value

    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        aria-selected={isActive}
        data-state={isActive ? 'active' : 'inactive'}
        className={cn(tabsTriggerVariants({ variant }), className)}
        onClick={() => onValueChange(value)}
        {...props}
      >
        {children}
        {badge !== undefined && (
          <Badge
            variant={isActive ? 'primary' : 'default'}
            size="sm"
            className="ml-2"
          >
            {badge}
          </Badge>
        )}
      </button>
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext()

    if (selectedValue !== value) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={selectedValue === value ? 'active' : 'inactive'}
        className={cn('mt-4', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants }
