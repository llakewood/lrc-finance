import type { Meta, StoryObj } from '@storybook/react-vite'
import { DashboardLayout } from './dashboard-layout'
import { MetricCard } from '../molecules/metric-card'
import { ContentCard } from '../molecules/content-card'
import { Button } from '../ui/button'

const meta: Meta<typeof DashboardLayout> = {
  title: 'Templates/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Revenue" value={125432} format="currency" />
        <MetricCard label="Expenses" value={98234} format="currency" />
        <MetricCard label="Net Income" value={27198} format="currency" change={12.5} />
        <MetricCard label="Cash on Hand" value={8542} format="currency" />
      </div>
    ),
  },
}

export const WithCustomTitles: Story = {
  args: {
    title: 'Little Red Coffee Analytics',
    subtitle: 'Business Intelligence',
    children: (
      <ContentCard title="Welcome" description="Your financial overview">
        <p className="text-text-muted">Dashboard content goes here...</p>
      </ContentCard>
    ),
  },
}

export const WithLiveData: Story = {
  args: {
    liveData: true,
    lastUpdated: '2 minutes ago',
    children: (
      <div className="space-y-4">
        <ContentCard title="Live Sales">
          <p className="text-2xl font-bold">$1,245.50</p>
          <p className="text-sm text-text-muted">42 transactions today</p>
        </ContentCard>
      </div>
    ),
  },
}

export const WithHeaderActions: Story = {
  args: {
    liveData: true,
    headerActions: (
      <>
        <Button variant="secondary" size="sm">
          Export
        </Button>
        <Button variant="primary" size="sm">
          Refresh
        </Button>
      </>
    ),
    children: (
      <div className="space-y-4">
        <ContentCard title="Financial Summary">
          <p className="text-text-muted">Content with header actions</p>
        </ContentCard>
      </div>
    ),
  },
}

export const FullDashboard: Story = {
  args: {
    liveData: true,
    lastUpdated: '2 hours ago',
    headerActions: (
      <Button variant="ghost" size="sm">
        Settings
      </Button>
    ),
    children: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Revenue" value={125432} format="currency" change={8.2} />
          <MetricCard label="Expenses" value={98234} format="currency" change={-3.1} />
          <MetricCard label="Net Income" value={27198} format="currency" change={15.4} />
          <MetricCard label="Cash" value={8542} format="currency" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ContentCard title="Top Products" description="Best sellers this month">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Latte</span>
                <span className="text-text-muted">$4,523</span>
              </li>
              <li className="flex justify-between">
                <span>Americano</span>
                <span className="text-text-muted">$3,215</span>
              </li>
              <li className="flex justify-between">
                <span>Cold Brew</span>
                <span className="text-text-muted">$2,134</span>
              </li>
            </ul>
          </ContentCard>
          <ContentCard title="Team" description="Active staff members">
            <p className="text-text-muted">5 active team members</p>
          </ContentCard>
        </div>
      </div>
    ),
  },
}
