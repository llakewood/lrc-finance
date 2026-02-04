import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textVariants = cva('', {
  variants: {
    variant: {
      default: 'text-text-default',
      muted: 'text-text-muted',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      primary: 'text-primary',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'base',
    weight: 'normal',
  },
})

type TextElement = 'p' | 'span' | 'div' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: TextElement
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant, size, weight, as: Component = 'p', ...props }, ref) => {
    return React.createElement(Component, {
      ref,
      className: cn(textVariants({ variant, size, weight, className })),
      ...props,
    })
  }
)
Text.displayName = 'Text'

export { Text, textVariants }
