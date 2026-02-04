import type { Meta, StoryObj } from '@storybook/react-vite'
import { DebtProgress } from './debt-progress'

const meta: Meta<typeof DebtProgress> = {
  title: 'Organisms/DebtProgress',
  component: DebtProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[450px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    debts: [
      {
        name: 'Line of Credit',
        currentBalance: 39000,
        originalBalance: 75000,
        interestRate: 8.5,
        change: -3000,
      },
      {
        name: 'Equipment Loan',
        currentBalance: 0,
        originalBalance: 15000,
        interestRate: 6.0,
        change: 0,
      },
    ],
  },
}

export const MultipleDebts: Story = {
  args: {
    debts: [
      {
        name: 'Business Line of Credit',
        currentBalance: 39000,
        originalBalance: 75000,
        interestRate: 8.5,
        change: -3000,
      },
      {
        name: 'Equipment Financing',
        currentBalance: 8500,
        originalBalance: 20000,
        interestRate: 6.0,
        change: -500,
      },
      {
        name: 'Small Business Loan',
        currentBalance: 12000,
        originalBalance: 25000,
        interestRate: 7.25,
        change: -1000,
      },
    ],
  },
}

export const HighProgress: Story = {
  args: {
    title: 'Almost There!',
    debts: [
      {
        name: 'Line of Credit',
        currentBalance: 5000,
        originalBalance: 75000,
        interestRate: 8.5,
        change: -2500,
      },
    ],
  },
}

export const JustStarting: Story = {
  args: {
    debts: [
      {
        name: 'New Business Loan',
        currentBalance: 48000,
        originalBalance: 50000,
        interestRate: 7.0,
        change: -2000,
      },
    ],
  },
}

export const WithoutTotals: Story = {
  args: {
    showTotals: false,
    debts: [
      {
        name: 'Line of Credit',
        currentBalance: 39000,
        originalBalance: 75000,
        change: -3000,
      },
    ],
  },
}

export const PaidIncrease: Story = {
  args: {
    debts: [
      {
        name: 'Line of Credit',
        currentBalance: 42000,
        originalBalance: 75000,
        interestRate: 8.5,
        change: 3000,
      },
    ],
  },
}
