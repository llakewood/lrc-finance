import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { Button } from './button'

const meta: Meta<typeof Card> = {
  title: 'Atoms/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'w-80',
    children: (
      <>
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
      </>
    ),
  },
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    className: 'w-80',
    children: (
      <>
        <CardHeader>
          <CardTitle>Outlined Card</CardTitle>
          <CardDescription>No shadow, just border</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A simpler card style with just a border.</p>
        </CardContent>
      </>
    ),
  },
}

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    className: 'w-80',
    children: (
      <>
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>More prominent shadow</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card has a more prominent shadow for emphasis.</p>
        </CardContent>
      </>
    ),
  },
}

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    className: 'w-80',
    children: (
      <>
        <CardHeader>
          <CardTitle>Compact Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Less padding for tighter layouts.</p>
        </CardContent>
      </>
    ),
  },
}

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    className: 'w-80',
    children: (
      <>
        <CardHeader>
          <CardTitle>Spacious Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>More padding for a spacious feel.</p>
        </CardContent>
      </>
    ),
  },
}

export const SimpleContent: Story = {
  args: {
    className: 'w-80',
    children: <p>Just some simple content without header or footer.</p>,
  },
}

export const MetricCard: Story = {
  args: {
    className: 'w-64',
    children: (
      <>
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl">$45,231.89</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-success">+12.5% from last month</p>
        </CardContent>
      </>
    ),
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card variant="default" className="w-48">
        <CardContent>Default</CardContent>
      </Card>
      <Card variant="outlined" className="w-48">
        <CardContent>Outlined</CardContent>
      </Card>
      <Card variant="elevated" className="w-48">
        <CardContent>Elevated</CardContent>
      </Card>
    </div>
  ),
}
