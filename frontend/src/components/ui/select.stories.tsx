import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from './select'

const meta: Meta<typeof Select> = {
  title: 'Atoms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success'],
    },
    selectSize: {
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
  render: (args) => (
    <Select {...args}>
      <option value="">Select an option...</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </Select>
  ),
}

export const Error: Story = {
  render: (args) => (
    <Select {...args} variant="error">
      <option value="">Select an option...</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    </Select>
  ),
}

export const Success: Story = {
  render: (args) => (
    <Select {...args} variant="success">
      <option value="">Select an option...</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    </Select>
  ),
}

export const Small: Story = {
  render: (args) => (
    <Select {...args} selectSize="sm">
      <option value="">Small select...</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    </Select>
  ),
}

export const Large: Story = {
  render: (args) => (
    <Select {...args} selectSize="lg">
      <option value="">Large select...</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    </Select>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <Select {...args} disabled>
      <option value="">Disabled select...</option>
      <option value="1">Option 1</option>
    </Select>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <Select variant="default">
        <option>Default</option>
      </Select>
      <Select variant="error">
        <option>Error</option>
      </Select>
      <Select variant="success">
        <option>Success</option>
      </Select>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <Select selectSize="sm">
        <option>Small</option>
      </Select>
      <Select selectSize="md">
        <option>Medium</option>
      </Select>
      <Select selectSize="lg">
        <option>Large</option>
      </Select>
    </div>
  ),
}
