import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './card'

const meta: Meta<typeof Card> = {
  title: 'Atoms/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'w-80',
    children: <p>Simple card content. The Card atom is just a styled container.</p>,
  },
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    className: 'w-80',
    children: <p>Outlined variant - border only, no shadow.</p>,
  },
}

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    className: 'w-80',
    children: <p>Elevated variant - more prominent shadow.</p>,
  },
}

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    className: 'w-80',
    children: <p>Compact padding for tighter layouts.</p>,
  },
}

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    className: 'w-80',
    children: <p>Spacious padding for prominent content.</p>,
  },
}

export const NoPadding: Story = {
  args: {
    padding: 'none',
    className: 'w-80',
    children: (
      <div className="p-4 bg-surface-bg">
        Custom padding handled by content.
      </div>
    ),
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card variant="default" className="w-48">
        <p>Default</p>
      </Card>
      <Card variant="outlined" className="w-48">
        <p>Outlined</p>
      </Card>
      <Card variant="elevated" className="w-48">
        <p>Elevated</p>
      </Card>
    </div>
  ),
}

export const AllPaddings: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card padding="none" className="w-64">
        <div className="p-2 bg-primary/10">None (custom)</div>
      </Card>
      <Card padding="sm" className="w-64">
        <p>Small padding</p>
      </Card>
      <Card padding="md" className="w-64">
        <p>Medium padding</p>
      </Card>
      <Card padding="lg" className="w-64">
        <p>Large padding</p>
      </Card>
    </div>
  ),
}
