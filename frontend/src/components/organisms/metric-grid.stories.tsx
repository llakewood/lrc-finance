import type { Meta, StoryObj } from '@storybook/react-vite'
import { MetricGrid } from './metric-grid'

const meta: Meta<typeof MetricGrid> = {
  title: 'Organisms/MetricGrid',
  component: MetricGrid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [2, 3, 4],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    metrics: [
      { label: 'Revenue', value: 45231.89, format: 'currency', change: 12.5 },
      { label: 'Orders', value: 2847, format: 'number', change: 8.2 },
      { label: 'Avg Order', value: 43.84, format: 'currency', decimals: 2, change: -3.4 },
      { label: 'Food Cost', value: 28.5, format: 'percent', change: -2.1, trend: 'up' },
    ],
  },
}

export const TwoColumns: Story = {
  args: {
    columns: 2,
    metrics: [
      { label: 'Revenue', value: 45231.89, format: 'currency', change: 12.5 },
      { label: 'Expenses', value: 38500, format: 'currency', change: 5.2 },
      { label: 'Net Income', value: 6731.89, format: 'currency', change: 18.3 },
      { label: 'Margin', value: 14.9, format: 'percent', change: 2.1 },
    ],
  },
}

export const ThreeColumns: Story = {
  args: {
    columns: 3,
    metrics: [
      { label: 'Hot Drinks', value: 18500, format: 'currency', change: 10.2 },
      { label: 'Cold Drinks', value: 12300, format: 'currency', change: 15.5 },
      { label: 'Food', value: 8900, format: 'currency', change: 8.1 },
      { label: 'Retail', value: 3200, format: 'currency', change: -2.3 },
      { label: 'Other', value: 2331.89, format: 'currency', change: 5.0 },
    ],
  },
}

export const WithInfo: Story = {
  args: {
    metrics: [
      {
        label: 'Revenue',
        value: 45231.89,
        format: 'currency',
        change: 12.5,
        info: 'Total sales revenue for the period',
      },
      {
        label: 'COGS',
        value: 12850,
        format: 'currency',
        change: 8.2,
        info: 'Cost of goods sold including ingredients and supplies',
      },
      {
        label: 'Labor',
        value: 14500,
        format: 'currency',
        change: 3.5,
        info: 'Total labor costs including wages and benefits',
      },
      {
        label: 'Net Income',
        value: 6731.89,
        format: 'currency',
        change: 18.3,
        info: 'Revenue minus all expenses',
      },
    ],
  },
}

export const FinancialDashboard: Story = {
  args: {
    metrics: [
      { label: 'Revenue', value: 252450, format: 'currency', change: 8.5, changeLabel: 'vs FY23-24' },
      { label: 'Net Income', value: 12450, format: 'currency', change: 25.3, changeLabel: 'vs FY23-24' },
      { label: 'Cash Balance', value: 8500, format: 'currency', info: 'Current available cash' },
      { label: 'Debt', value: 39000, format: 'currency', change: -15.2, trend: 'up', changeLabel: 'paid down' },
    ],
  },
}
