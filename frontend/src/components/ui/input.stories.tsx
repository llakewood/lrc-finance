import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success'],
    },
    inputSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithValue: Story = {
  args: {
    value: 'Hello World',
  },
}

export const Error: Story = {
  args: {
    placeholder: 'Invalid input',
    variant: 'error',
  },
}

export const Success: Story = {
  args: {
    placeholder: 'Valid input',
    variant: 'success',
  },
}

export const Small: Story = {
  args: {
    placeholder: 'Small input',
    inputSize: 'sm',
  },
}

export const Large: Story = {
  args: {
    placeholder: 'Large input',
    inputSize: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
}

export const NumberInput: Story = {
  args: {
    type: 'number',
    placeholder: '0.00',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <Input placeholder="Default input" variant="default" />
      <Input placeholder="Error input" variant="error" />
      <Input placeholder="Success input" variant="success" />
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <Input placeholder="Small" inputSize="sm" />
      <Input placeholder="Medium" inputSize="md" />
      <Input placeholder="Large" inputSize="lg" />
    </div>
  ),
}
