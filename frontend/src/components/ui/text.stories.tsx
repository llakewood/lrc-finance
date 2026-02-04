import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from './text'

const meta: Meta<typeof Text> = {
  title: 'Atoms/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'muted', 'success', 'warning', 'danger', 'primary'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'],
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
    },
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Default text content',
  },
}

export const Muted: Story = {
  args: {
    children: 'Muted text for secondary information',
    variant: 'muted',
  },
}

export const Success: Story = {
  args: {
    children: '+12.5% increase',
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    children: 'Attention required',
    variant: 'warning',
  },
}

export const Danger: Story = {
  args: {
    children: '-8.3% decrease',
    variant: 'danger',
  },
}

export const Primary: Story = {
  args: {
    children: 'Branded text',
    variant: 'primary',
  },
}

export const ExtraSmall: Story = {
  args: {
    children: 'Extra small text',
    size: 'xs',
  },
}

export const Small: Story = {
  args: {
    children: 'Small text',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large text',
    size: 'lg',
  },
}

export const ExtraLarge: Story = {
  args: {
    children: 'Extra large text',
    size: 'xl',
  },
}

export const Bold: Story = {
  args: {
    children: 'Bold text',
    weight: 'bold',
  },
}

export const Semibold: Story = {
  args: {
    children: 'Semibold text',
    weight: 'semibold',
  },
}

export const AsHeading: Story = {
  args: {
    children: 'This is a heading',
    as: 'h1',
    size: '3xl',
    weight: 'bold',
  },
}

export const AsLabel: Story = {
  args: {
    children: 'Form Label',
    as: 'label',
    size: 'sm',
    weight: 'medium',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text variant="default">Default text</Text>
      <Text variant="muted">Muted text</Text>
      <Text variant="primary">Primary text</Text>
      <Text variant="success">Success text</Text>
      <Text variant="warning">Warning text</Text>
      <Text variant="danger">Danger text</Text>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text size="xs">Extra Small (xs)</Text>
      <Text size="sm">Small (sm)</Text>
      <Text size="base">Base</Text>
      <Text size="lg">Large (lg)</Text>
      <Text size="xl">Extra Large (xl)</Text>
      <Text size="2xl">2XL</Text>
      <Text size="3xl">3XL</Text>
    </div>
  ),
}

export const AllWeights: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text weight="normal">Normal weight</Text>
      <Text weight="medium">Medium weight</Text>
      <Text weight="semibold">Semibold weight</Text>
      <Text weight="bold">Bold weight</Text>
    </div>
  ),
}

export const MetricDisplay: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <Text size="sm" variant="muted">Total Revenue</Text>
      <Text size="3xl" weight="bold">$45,231.89</Text>
      <Text size="sm" variant="success">+12.5% from last month</Text>
    </div>
  ),
}
