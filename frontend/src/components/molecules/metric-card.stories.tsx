import type { Meta, StoryObj } from '@storybook/react-vite'
import { MetricCard } from './metric-card'

const meta: Meta<typeof MetricCard> = {
  title: 'Molecules/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    format: {
      control: 'select',
      options: ['currency', 'percent', 'number', 'none'],
    },
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral', undefined],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Total Revenue',
    value: 45231.89,
    format: 'currency',
    className: 'w-64',
  },
}

export const WithChange: Story = {
  args: {
    label: 'Total Revenue',
    value: 45231.89,
    format: 'currency',
    change: 12.5,
    changeLabel: 'vs last month',
    className: 'w-64',
  },
}

export const NegativeChange: Story = {
  args: {
    label: 'Average Order',
    value: 43.84,
    format: 'currency',
    decimals: 2,
    change: -3.4,
    changeLabel: 'vs last month',
    className: 'w-64',
  },
}

export const PercentFormat: Story = {
  args: {
    label: 'Food Cost',
    value: 28.5,
    format: 'percent',
    decimals: 1,
    change: -2.1,
    changeLabel: 'improved',
    trend: 'up', // Lower food cost is good
    className: 'w-64',
  },
}

export const WithInfo: Story = {
  args: {
    label: 'Net Income',
    value: 12450,
    format: 'currency',
    change: 8.2,
    info: 'Total revenue minus all expenses including COGS and G&A',
    className: 'w-64',
  },
}

export const NumberFormat: Story = {
  args: {
    label: 'Total Orders',
    value: 2847,
    format: 'number',
    change: 15.3,
    className: 'w-64',
  },
}

export const Elevated: Story = {
  args: {
    label: 'Cash Balance',
    value: 8500,
    format: 'currency',
    info: 'Current available cash',
    variant: 'elevated',
    className: 'w-64',
  },
}

export const DashboardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <MetricCard
        label="Revenue"
        value={45231.89}
        format="currency"
        change={12.5}
      />
      <MetricCard
        label="Orders"
        value={2847}
        format="number"
        change={8.2}
      />
      <MetricCard
        label="Avg Order"
        value={43.84}
        format="currency"
        decimals={2}
        change={-3.4}
      />
      <MetricCard
        label="Food Cost"
        value={28.5}
        format="percent"
        change={-2.1}
        trend="up"
      />
    </div>
  ),
}
