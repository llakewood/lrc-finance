import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './content-card'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof Card> = {
  title: 'Molecules/ContentCard',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Complete: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with some text that describes something important.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
}

export const WithoutFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
        <CardDescription>No footer needed</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Sometimes you just need a header and content.</p>
      </CardContent>
    </Card>
  ),
}

export const TitleOnly: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Title Only Header</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Description is optional.</p>
      </CardContent>
    </Card>
  ),
}

export const MetricCard: Story = {
  render: () => (
    <Card className="w-64">
      <CardHeader>
        <CardDescription>Total Revenue</CardDescription>
        <CardTitle className="text-2xl">$45,231.89</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-success">+12.5% from last month</p>
      </CardContent>
    </Card>
  ),
}

export const MultipleActions: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Confirm Action</CardTitle>
        <CardDescription>Are you sure you want to proceed?</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This action cannot be undone.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button variant="danger">Delete</Button>
      </CardFooter>
    </Card>
  ),
}

export const ElevatedMetric: Story = {
  render: () => (
    <Card variant="elevated" className="w-64">
      <CardHeader>
        <CardDescription>Active Users</CardDescription>
        <CardTitle className="text-3xl">2,847</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-muted">Currently online</p>
      </CardContent>
    </Card>
  ),
}

export const CompactCard: Story = {
  render: () => (
    <Card padding="sm" className="w-72">
      <CardHeader>
        <CardTitle className="text-base">Compact Layout</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Smaller padding for dense UIs.</p>
      </CardContent>
    </Card>
  ),
}

export const DashboardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card className="w-48">
        <CardHeader>
          <CardDescription>Revenue</CardDescription>
          <CardTitle>$12,450</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-sm text-success">+8.2%</span>
        </CardContent>
      </Card>
      <Card className="w-48">
        <CardHeader>
          <CardDescription>Orders</CardDescription>
          <CardTitle>284</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-sm text-success">+12.1%</span>
        </CardContent>
      </Card>
      <Card className="w-48">
        <CardHeader>
          <CardDescription>Avg Order</CardDescription>
          <CardTitle>$43.84</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-sm text-danger">-3.4%</span>
        </CardContent>
      </Card>
      <Card className="w-48">
        <CardHeader>
          <CardDescription>Customers</CardDescription>
          <CardTitle>1,203</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-sm text-success">+5.7%</span>
        </CardContent>
      </Card>
    </div>
  ),
}
