import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProgressBar } from './progress-bar'

const meta: Meta<typeof ProgressBar> = {
  title: 'Molecules/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    color: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'danger'],
    },
    labelFormat: {
      control: 'select',
      options: ['percent', 'value', 'fraction'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 65,
    max: 100,
  },
}

export const WithLabel: Story = {
  args: {
    value: 65,
    max: 100,
    showLabel: true,
  },
}

export const FractionLabel: Story = {
  args: {
    value: 8500,
    max: 20000,
    showLabel: true,
    labelFormat: 'fraction',
    color: 'success',
  },
}

export const Small: Story = {
  args: {
    value: 45,
    max: 100,
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    value: 75,
    max: 100,
    size: 'lg',
    showLabel: true,
  },
}

export const Success: Story = {
  args: {
    value: 100,
    max: 100,
    color: 'success',
    showLabel: true,
  },
}

export const Warning: Story = {
  args: {
    value: 45,
    max: 100,
    color: 'warning',
    showLabel: true,
  },
}

export const Danger: Story = {
  args: {
    value: 25,
    max: 100,
    color: 'danger',
    showLabel: true,
  },
}

export const DebtPayoff: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Line of Credit</span>
          <span className="text-sm text-text-muted">$8,500 / $20,000</span>
        </div>
        <ProgressBar value={8500} max={20000} color="success" />
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Equipment Loan</span>
          <span className="text-sm text-text-muted">$12,000 / $15,000</span>
        </div>
        <ProgressBar value={12000} max={15000} color="warning" />
      </div>
    </div>
  ),
}

export const AllColors: Story = {
  render: () => (
    <div className="space-y-3">
      <ProgressBar value={75} color="primary" showLabel />
      <ProgressBar value={85} color="success" showLabel />
      <ProgressBar value={50} color="warning" showLabel />
      <ProgressBar value={25} color="danger" showLabel />
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <span className="text-sm text-text-muted">Small</span>
        <ProgressBar value={65} size="sm" />
      </div>
      <div>
        <span className="text-sm text-text-muted">Medium</span>
        <ProgressBar value={65} size="md" />
      </div>
      <div>
        <span className="text-sm text-text-muted">Large</span>
        <ProgressBar value={65} size="lg" />
      </div>
    </div>
  ),
}
