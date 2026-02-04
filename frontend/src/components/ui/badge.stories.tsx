import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'solid', 'solid-success', 'solid-warning', 'solid-danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
}

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
}

export const Danger: Story = {
  args: {
    children: 'Danger',
    variant: 'danger',
  },
}

export const Solid: Story = {
  args: {
    children: 'Solid',
    variant: 'solid',
  },
}

export const SolidSuccess: Story = {
  args: {
    children: 'Completed',
    variant: 'solid-success',
  },
}

export const SolidWarning: Story = {
  args: {
    children: 'Pending',
    variant: 'solid-warning',
  },
}

export const SolidDanger: Story = {
  args: {
    children: 'Failed',
    variant: 'solid-danger',
  },
}

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
}

export const OutlinedVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
    </div>
  ),
}

export const SolidVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="solid">Solid</Badge>
      <Badge variant="solid-success">Success</Badge>
      <Badge variant="solid-warning">Warning</Badge>
      <Badge variant="solid-danger">Danger</Badge>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
}

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="solid-success">Active</Badge>
      <Badge variant="solid-warning">Pending</Badge>
      <Badge variant="solid-danger">Inactive</Badge>
      <Badge variant="default">Draft</Badge>
    </div>
  ),
}
