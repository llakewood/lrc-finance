import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from './icon-button'

// Simple SVG icons for stories
const EditIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const InfoIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const meta: Meta<typeof IconButton> = {
  title: 'Atoms/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'primary', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: {
      control: 'boolean',
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
    icon: <EditIcon />,
    title: 'Edit',
  },
}

export const Ghost: Story = {
  args: {
    icon: <InfoIcon />,
    variant: 'ghost',
    title: 'Info',
  },
}

export const Primary: Story = {
  args: {
    icon: <PlusIcon />,
    variant: 'primary',
    title: 'Add',
  },
}

export const Danger: Story = {
  args: {
    icon: <TrashIcon />,
    variant: 'danger',
    title: 'Delete',
  },
}

export const Small: Story = {
  args: {
    icon: <EditIcon />,
    size: 'sm',
    title: 'Edit',
  },
}

export const Large: Story = {
  args: {
    icon: <EditIcon />,
    size: 'lg',
    title: 'Edit',
  },
}

export const Loading: Story = {
  args: {
    icon: <EditIcon />,
    loading: true,
    title: 'Edit',
  },
}

export const LoadingPrimary: Story = {
  args: {
    icon: <PlusIcon />,
    variant: 'primary',
    loading: true,
    title: 'Add',
  },
}

export const Disabled: Story = {
  args: {
    icon: <EditIcon />,
    disabled: true,
    title: 'Edit',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton icon={<EditIcon />} variant="default" title="Default" />
      <IconButton icon={<InfoIcon />} variant="ghost" title="Ghost" />
      <IconButton icon={<PlusIcon />} variant="primary" title="Primary" />
      <IconButton icon={<TrashIcon />} variant="danger" title="Danger" />
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton icon={<EditIcon />} size="sm" title="Small" />
      <IconButton icon={<EditIcon />} size="md" title="Medium" />
      <IconButton icon={<EditIcon />} size="lg" title="Large" />
    </div>
  ),
}

export const ActionGroup: Story = {
  render: () => (
    <div className="flex items-center gap-1 p-2 bg-surface-card border border-border rounded">
      <IconButton icon={<EditIcon />} title="Edit" />
      <IconButton icon={<TrashIcon />} variant="danger" title="Delete" />
    </div>
  ),
}
