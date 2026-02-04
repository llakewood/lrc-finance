import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './spinner'

const meta: Meta<typeof Spinner> = {
  title: 'Atoms/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['default', 'muted', 'white'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
}

export const Muted: Story = {
  args: {
    variant: 'muted',
  },
}

export const OnDark: Story = {
  args: {
    variant: 'white',
  },
  decorators: [
    (Story) => (
      <div className="bg-primary p-8 rounded">
        <Story />
      </div>
    ),
  ],
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Spinner size="sm" />
      <span className="text-sm text-text-muted">Loading...</span>
    </div>
  ),
}
