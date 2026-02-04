import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusDot } from './status-dot'

const meta: Meta<typeof StatusDot> = {
  title: 'Atoms/StatusDot',
  component: StatusDot,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'linked', 'unlinked', 'live'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    pulse: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Success: Story = {
  args: {
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
  },
}

export const Linked: Story = {
  args: {
    variant: 'linked',
  },
}

export const Unlinked: Story = {
  args: {
    variant: 'unlinked',
  },
}

export const Live: Story = {
  args: {
    variant: 'live',
    pulse: true,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <StatusDot variant="default" />
        <span className="text-sm">Default</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot variant="success" />
        <span className="text-sm">Success</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot variant="warning" />
        <span className="text-sm">Warning</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot variant="danger" />
        <span className="text-sm">Danger</span>
      </div>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <StatusDot variant="success" size="sm" />
        <span className="text-sm">Small</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot variant="success" size="md" />
        <span className="text-sm">Medium</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot variant="success" size="lg" />
        <span className="text-sm">Large</span>
      </div>
    </div>
  ),
}

export const LinkingStatus: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <StatusDot variant="linked" />
        <span className="text-sm">Butter (linked to master ingredient)</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot variant="unlinked" />
        <span className="text-sm">Vannilla Extract (needs linking)</span>
      </div>
    </div>
  ),
}

export const LiveIndicator: Story = {
  render: () => (
    <div className="flex items-center gap-2 bg-surface-card p-3 rounded border border-border">
      <StatusDot variant="live" pulse />
      <span className="text-sm font-medium">Live Data</span>
    </div>
  ),
}
