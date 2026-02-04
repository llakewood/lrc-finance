import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

const pillVariants = cva(
  'px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer',
  {
    variants: {
      state: {
        active: 'bg-primary text-white',
        inactive: 'bg-surface-bg text-text-muted hover:bg-border hover:text-text-default',
      },
    },
    defaultVariants: {
      state: 'inactive',
    },
  }
)

export interface YearOption {
  value: string
  label: string
}

export interface YearFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  options: YearOption[]
  value?: string
  onValueChange?: (value: string) => void
}

const YearFilter = React.forwardRef<HTMLDivElement, YearFilterProps>(
  ({ className, label = 'Fiscal Year', options, value, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(options[0]?.value ?? '')
    const currentValue = value ?? internalValue

    const handleSelect = (optionValue: string) => {
      setInternalValue(optionValue)
      onValueChange?.(optionValue)
    }

    return (
      <div ref={ref} className={cn('flex items-center gap-3', className)} {...props}>
        {label && (
          <Text size="sm" variant="muted">
            {label}:
          </Text>
        )}
        <div className="flex gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                pillVariants({ state: currentValue === option.value ? 'active' : 'inactive' })
              )}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    )
  }
)
YearFilter.displayName = 'YearFilter'

export { YearFilter, pillVariants }
