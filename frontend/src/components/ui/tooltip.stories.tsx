import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tooltip } from './tooltip'
import { Button } from './button'
import { Badge } from './badge'

const meta: Meta<typeof Tooltip> = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'light'],
    },
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <Button>Hover me</Button>,
  },
}

export const LightVariant: Story = {
  args: {
    content: 'Light tooltip',
    variant: 'light',
    children: <Button variant="secondary">Hover me</Button>,
  },
}

export const TopPosition: Story = {
  args: {
    content: 'Top tooltip',
    position: 'top',
    children: <Button>Top</Button>,
  },
}

export const BottomPosition: Story = {
  args: {
    content: 'Bottom tooltip',
    position: 'bottom',
    children: <Button>Bottom</Button>,
  },
}

export const LeftPosition: Story = {
  args: {
    content: 'Left tooltip',
    position: 'left',
    children: <Button>Left</Button>,
  },
}

export const RightPosition: Story = {
  args: {
    content: 'Right tooltip',
    position: 'right',
    children: <Button>Right</Button>,
  },
}

export const WithBadge: Story = {
  args: {
    content: 'Active users this month',
    children: <Badge variant="success">Active</Badge>,
  },
}

export const WithInfoIcon: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span>Revenue</span>
      <Tooltip content="Total revenue including all product categories">
        <span className="cursor-help text-text-muted">ⓘ</span>
      </Tooltip>
    </div>
  ),
}

export const AllPositions: Story = {
  render: () => (
    <div className="flex gap-8 p-16">
      <Tooltip content="Top" position="top">
        <Button variant="ghost">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom" position="bottom">
        <Button variant="ghost">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left" position="left">
        <Button variant="ghost">Left</Button>
      </Tooltip>
      <Tooltip content="Right" position="right">
        <Button variant="ghost">Right</Button>
      </Tooltip>
    </div>
  ),
}

export const BothVariants: Story = {
  render: () => (
    <div className="flex gap-8 p-8">
      <Tooltip content="Dark tooltip (default)" variant="default">
        <Button>Default</Button>
      </Tooltip>
      <Tooltip content="Light tooltip" variant="light">
        <Button variant="secondary">Light</Button>
      </Tooltip>
    </div>
  ),
}

export const LongContent: Story = {
  args: {
    content: 'This is a longer tooltip that explains something in more detail. Hover to see the full text.',
    children: <Button>Hover for details</Button>,
  },
}
