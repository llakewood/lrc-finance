import type { Meta, StoryObj } from '@storybook/react-vite'
import { BenchmarkList } from './benchmark-list'

const meta: Meta<typeof BenchmarkList> = {
  title: 'Organisms/BenchmarkList',
  component: BenchmarkList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Industry Benchmarks',
    description: 'Compare your metrics to coffee shop industry standards',
    benchmarks: [
      {
        label: 'Food Cost',
        value: 28.5,
        min: 0,
        max: 50,
        industryLow: 25,
        industryHigh: 35,
        format: 'percent',
        info: 'Cost of goods sold as % of revenue',
      },
      {
        label: 'Labor Cost',
        value: 32,
        min: 0,
        max: 50,
        industryLow: 25,
        industryHigh: 35,
        format: 'percent',
        info: 'Total labor expense as % of revenue',
      },
      {
        label: 'Net Profit',
        value: 4.9,
        min: 0,
        max: 15,
        industryLow: 3,
        industryHigh: 9,
        format: 'percent',
        info: 'Net income as % of revenue',
      },
      {
        label: 'Rent/Occupancy',
        value: 8,
        min: 0,
        max: 20,
        industryLow: 5,
        industryHigh: 10,
        format: 'percent',
        info: 'Rent and occupancy costs as % of revenue',
      },
    ],
  },
}

export const AllInRange: Story = {
  args: {
    title: 'Performance Metrics',
    benchmarks: [
      { label: 'Food Cost', value: 30, min: 0, max: 50, industryLow: 25, industryHigh: 35, format: 'percent' },
      { label: 'Labor Cost', value: 28, min: 0, max: 50, industryLow: 25, industryHigh: 35, format: 'percent' },
      { label: 'Net Profit', value: 6.5, min: 0, max: 15, industryLow: 3, industryHigh: 9, format: 'percent' },
    ],
  },
}

export const NeedsImprovement: Story = {
  args: {
    title: 'Areas for Improvement',
    description: 'These metrics are outside industry benchmarks',
    benchmarks: [
      { label: 'Food Cost', value: 42, min: 0, max: 50, industryLow: 25, industryHigh: 35, format: 'percent' },
      { label: 'Labor Cost', value: 40, min: 0, max: 50, industryLow: 25, industryHigh: 35, format: 'percent' },
      { label: 'Net Profit', value: 1.5, min: 0, max: 15, industryLow: 3, industryHigh: 9, format: 'percent' },
    ],
  },
}

export const NoHeader: Story = {
  args: {
    benchmarks: [
      { label: 'Metric A', value: 65, min: 0, max: 100, industryLow: 50, industryHigh: 80, format: 'percent' },
      { label: 'Metric B', value: 45, min: 0, max: 100, industryLow: 40, industryHigh: 60, format: 'percent' },
    ],
  },
}
