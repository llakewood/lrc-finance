import type { Meta, StoryObj } from '@storybook/react-vite'
import { BenchmarkBar } from './benchmark-bar'

const meta: Meta<typeof BenchmarkBar> = {
  title: 'Molecules/BenchmarkBar',
  component: BenchmarkBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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
    label: 'Food Cost',
    value: 28.5,
    min: 0,
    max: 50,
    industryLow: 25,
    industryHigh: 35,
    format: 'percent',
  },
}

export const InRange: Story = {
  args: {
    label: 'Labor Cost',
    value: 30,
    min: 0,
    max: 50,
    industryLow: 25,
    industryHigh: 35,
    format: 'percent',
    info: 'Percentage of revenue spent on labor',
  },
}

export const BelowRange: Story = {
  args: {
    label: 'Net Profit Margin',
    value: 3.5,
    min: 0,
    max: 20,
    industryLow: 5,
    industryHigh: 10,
    format: 'percent',
  },
}

export const AboveRange: Story = {
  args: {
    label: 'Overhead',
    value: 42,
    min: 0,
    max: 50,
    industryLow: 25,
    industryHigh: 35,
    format: 'percent',
  },
}

export const WithoutIndustryRange: Story = {
  args: {
    label: 'Custom Metric',
    value: 65,
    min: 0,
    max: 100,
    format: 'percent',
  },
}

export const NumberFormat: Story = {
  args: {
    label: 'Revenue per Sqft',
    value: 450,
    min: 0,
    max: 1000,
    industryLow: 350,
    industryHigh: 600,
    format: 'number',
    info: 'Annual revenue per square foot',
  },
}

export const BenchmarkList: Story = {
  render: () => (
    <div className="space-y-6">
      <BenchmarkBar
        label="Food Cost"
        value={28.5}
        min={0}
        max={50}
        industryLow={25}
        industryHigh={35}
        format="percent"
        info="Cost of goods sold as % of revenue"
      />
      <BenchmarkBar
        label="Labor Cost"
        value={32}
        min={0}
        max={50}
        industryLow={25}
        industryHigh={35}
        format="percent"
        info="Total labor expense as % of revenue"
      />
      <BenchmarkBar
        label="Net Profit"
        value={4.2}
        min={0}
        max={15}
        industryLow={3}
        industryHigh={9}
        format="percent"
        info="Net income as % of revenue"
      />
      <BenchmarkBar
        label="Rent/Occupancy"
        value={12}
        min={0}
        max={20}
        industryLow={5}
        industryHigh={10}
        format="percent"
        info="Rent and occupancy costs as % of revenue"
      />
    </div>
  ),
}
