import type { Meta, StoryObj } from '@storybook/react-vite'
import { GridLayout } from './grid-layout'
import { MetricCard } from '../molecules/metric-card'
import { ContentCard } from '../molecules/content-card'

const meta: Meta<typeof GridLayout> = {
  title: 'Templates/GridLayout',
  component: GridLayout,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <>
        <MetricCard label="Revenue" value={125432} format="currency" />
        <MetricCard label="Expenses" value={98234} format="currency" />
        <MetricCard label="Net Income" value={27198} format="currency" />
        <MetricCard label="Cash" value={8542} format="currency" />
      </>
    ),
  },
}

export const OneColumn: Story = {
  args: {
    columns: 1,
    children: (
      <>
        <ContentCard title="Full Width Card">
          <p className="text-text-muted">This card spans the full width...</p>
        </ContentCard>
        <ContentCard title="Another Full Width">
          <p className="text-text-muted">Stacked vertically...</p>
        </ContentCard>
      </>
    ),
  },
}

export const TwoColumns: Story = {
  args: {
    columns: 2,
    children: (
      <>
        <ContentCard title="Left Column">
          <p className="text-text-muted">Content here...</p>
        </ContentCard>
        <ContentCard title="Right Column">
          <p className="text-text-muted">Content here...</p>
        </ContentCard>
      </>
    ),
  },
}

export const ThreeColumns: Story = {
  args: {
    columns: 3,
    children: (
      <>
        <ContentCard title="Column 1">
          <p className="text-text-muted">Content</p>
        </ContentCard>
        <ContentCard title="Column 2">
          <p className="text-text-muted">Content</p>
        </ContentCard>
        <ContentCard title="Column 3">
          <p className="text-text-muted">Content</p>
        </ContentCard>
      </>
    ),
  },
}

export const FourColumns: Story = {
  args: {
    columns: 4,
    children: (
      <>
        <MetricCard label="Q1" value={32500} format="currency" />
        <MetricCard label="Q2" value={35200} format="currency" />
        <MetricCard label="Q3" value={28900} format="currency" />
        <MetricCard label="Q4" value={38700} format="currency" />
      </>
    ),
  },
}

export const LargeGap: Story = {
  args: {
    columns: 2,
    gap: 'lg',
    children: (
      <>
        <ContentCard title="Card 1">
          <p className="text-text-muted">With large gap...</p>
        </ContentCard>
        <ContentCard title="Card 2">
          <p className="text-text-muted">Between cards...</p>
        </ContentCard>
      </>
    ),
  },
}

export const SmallGap: Story = {
  args: {
    columns: 4,
    gap: 'sm',
    children: (
      <>
        <MetricCard label="Metric 1" value={100} />
        <MetricCard label="Metric 2" value={200} />
        <MetricCard label="Metric 3" value={300} />
        <MetricCard label="Metric 4" value={400} />
      </>
    ),
  },
}

export const MixedContent: Story = {
  args: {
    columns: 3,
    children: (
      <>
        <MetricCard label="Total Sales" value={45000} format="currency" change={12.5} />
        <ContentCard title="Top Product">
          <p className="font-medium">Classic Latte</p>
          <p className="text-sm text-text-muted">892 sold this month</p>
        </ContentCard>
        <MetricCard label="Avg Transaction" value={12.75} format="currency" />
      </>
    ),
  },
}

export const ResponsiveGrid: Story = {
  args: {
    columns: 4,
    children: (
      <>
        <MetricCard label="Revenue" value={125432} format="currency" />
        <MetricCard label="COGS" value={41234} format="currency" />
        <MetricCard label="Labor" value={38500} format="currency" />
        <MetricCard label="Overhead" value={18500} format="currency" />
        <MetricCard label="Net Income" value={27198} format="currency" />
        <MetricCard label="Margin" value={21.7} format="percent" />
        <MetricCard label="Cash" value={8542} format="currency" />
        <MetricCard label="Debt" value={37500} format="currency" />
      </>
    ),
  },
}
