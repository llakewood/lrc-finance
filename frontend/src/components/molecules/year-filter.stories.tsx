import type { Meta, StoryObj } from '@storybook/react-vite'
import { YearFilter } from './year-filter'

const fiscalYears = [
  { value: 'FY24-25', label: 'FY24-25' },
  { value: 'FY23-24', label: 'FY23-24' },
  { value: 'FY22-23', label: 'FY22-23' },
]

const quarters = [
  { value: 'Q1', label: 'Q1' },
  { value: 'Q2', label: 'Q2' },
  { value: 'Q3', label: 'Q3' },
  { value: 'Q4', label: 'Q4' },
]

const months = [
  { value: '2024-01', label: 'Jan' },
  { value: '2024-02', label: 'Feb' },
  { value: '2024-03', label: 'Mar' },
  { value: '2024-04', label: 'Apr' },
  { value: '2024-05', label: 'May' },
  { value: '2024-06', label: 'Jun' },
]

const meta: Meta<typeof YearFilter> = {
  title: 'Molecules/YearFilter',
  component: YearFilter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Fiscal Year',
    options: fiscalYears,
    value: 'FY24-25',
  },
}

export const Quarters: Story = {
  args: {
    label: 'Quarter',
    options: quarters,
    value: 'Q1',
  },
}

export const Months: Story = {
  args: {
    label: 'Month',
    options: months,
    value: '2024-01',
  },
}

export const NoLabel: Story = {
  args: {
    label: '',
    options: fiscalYears,
    value: 'FY24-25',
  },
}

export const TwoOptions: Story = {
  args: {
    label: 'Compare',
    options: [
      { value: 'current', label: 'Current' },
      { value: 'previous', label: 'Previous' },
    ],
    value: 'current',
  },
}

export const InHeader: Story = {
  render: () => (
    <div className="flex items-center justify-between w-[500px] p-4 bg-surface-card rounded-lg border border-border">
      <h2 className="text-lg font-semibold">Financial Overview</h2>
      <YearFilter
        label="Year"
        options={fiscalYears}
        value="FY24-25"
      />
    </div>
  ),
}

export const MultipleFilters: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4 bg-surface-card rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Revenue Report</h2>
        <div className="flex items-center gap-6">
          <YearFilter
            label="Year"
            options={fiscalYears}
            value="FY24-25"
          />
          <YearFilter
            label="Quarter"
            options={quarters}
            value="Q1"
          />
        </div>
      </div>
    </div>
  ),
}
