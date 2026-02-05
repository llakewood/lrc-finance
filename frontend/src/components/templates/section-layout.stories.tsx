import type { Meta, StoryObj } from '@storybook/react-vite'
import { SectionLayout } from './section-layout'
import { MetricCard } from '../molecules/metric-card'
import { ContentCard } from '../molecules/content-card'
import { Button } from '../ui/button'

const meta: Meta<typeof SectionLayout> = {
  title: 'Templates/SectionLayout',
  component: SectionLayout,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-4xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Financial Overview',
    children: (
      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Revenue" value={125432} format="currency" />
        <MetricCard label="Expenses" value={98234} format="currency" />
      </div>
    ),
  },
}

export const WithDescription: Story = {
  args: {
    title: 'Industry Benchmarks',
    description: 'Compare your metrics against coffee shop industry standards',
    children: (
      <ContentCard>
        <p className="text-text-muted">Benchmark comparison content...</p>
      </ContentCard>
    ),
  },
}

export const WithActions: Story = {
  args: {
    title: 'Recipe Costing',
    description: 'Track ingredient costs and profit margins',
    actions: (
      <>
        <Button variant="secondary" size="sm">
          Add Recipe
        </Button>
        <Button variant="primary" size="sm">
          Reload Data
        </Button>
      </>
    ),
    children: (
      <ContentCard>
        <p className="text-text-muted">Recipe list content...</p>
      </ContentCard>
    ),
  },
}

export const CardVariant: Story = {
  args: {
    title: 'Debt Progress',
    description: 'Track your loan paydown',
    variant: 'card',
    children: (
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Line of Credit</span>
          <span className="text-text-muted">$12,500 / $50,000</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/4 bg-success rounded-full" />
        </div>
      </div>
    ),
  },
}

export const CardVariantWithActions: Story = {
  args: {
    title: 'Square Integration',
    description: 'Live data from your POS system',
    variant: 'card',
    actions: <Button size="sm">Refresh</Button>,
    children: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold">$1,245.50</p>
          <p className="text-sm text-text-muted">Sales today</p>
        </div>
        <div>
          <p className="text-2xl font-bold">42</p>
          <p className="text-sm text-text-muted">Transactions</p>
        </div>
      </div>
    ),
  },
}

export const MultipleCards: Story = {
  args: {
    title: 'Product Performance',
    description: 'Top selling items and categories',
    actions: <Button variant="ghost" size="sm">View All</Button>,
    children: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ContentCard title="Top Items">
          <ul className="text-sm space-y-1">
            <li>Latte - 28 sold</li>
            <li>Americano - 19 sold</li>
            <li>Croissant - 15 sold</li>
          </ul>
        </ContentCard>
        <ContentCard title="Categories">
          <ul className="text-sm space-y-1">
            <li>Hot Drinks - $4,523</li>
            <li>Cold Drinks - $2,134</li>
            <li>Food - $1,876</li>
          </ul>
        </ContentCard>
      </div>
    ),
  },
}
