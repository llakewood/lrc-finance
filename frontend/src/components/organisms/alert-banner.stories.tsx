import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertBanner } from './alert-banner'

const meta: Meta<typeof AlertBanner> = {
  title: 'Organisms/AlertBanner',
  component: AlertBanner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'warning', 'success', 'error'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'New Feature Available',
    description: 'You can now export your data to CSV format.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Unlinked Ingredients',
    description: '18 recipe ingredients are not linked to the master ingredient list.',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Changes Saved',
    description: 'Your recipe has been updated successfully.',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Connection Error',
    description: 'Unable to connect to Square API. Please check your credentials.',
  },
}

export const WithAction: Story = {
  args: {
    variant: 'warning',
    title: 'Ingredients Need Linking',
    description: '18 recipe ingredients need to be matched to your master ingredient list for accurate cost calculations.',
    action: {
      label: 'Link Ingredients',
      onClick: () => console.log('Link clicked'),
    },
  },
}

export const Dismissible: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true)
    if (!visible) {
      return (
        <button
          onClick={() => setVisible(true)}
          className="text-sm text-primary hover:underline"
        >
          Show banner again
        </button>
      )
    }
    return (
      <AlertBanner
        variant="info"
        title="Welcome!"
        description="This banner can be dismissed."
        onDismiss={() => setVisible(false)}
      />
    )
  },
}

export const NoIcon: Story = {
  args: {
    variant: 'info',
    title: 'Note',
    description: 'This banner has no icon.',
    showIcon: false,
  },
}

export const TitleOnly: Story = {
  args: {
    variant: 'success',
    title: 'All ingredients are linked!',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <AlertBanner variant="info" title="Info" description="Informational message." />
      <AlertBanner variant="warning" title="Warning" description="Warning message." />
      <AlertBanner variant="success" title="Success" description="Success message." />
      <AlertBanner variant="error" title="Error" description="Error message." />
    </div>
  ),
}

export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-4">
      <AlertBanner
        variant="warning"
        title="Recipe Costs May Be Inaccurate"
        description="18 ingredients are not linked to the master list. Link them for accurate cost calculations."
        action={{
          label: 'Review Unlinked',
          onClick: () => console.log('Review clicked'),
        }}
      />
      <AlertBanner
        variant="info"
        title="Square Data Updated"
        description="Last synced 5 minutes ago. Sales data is current through yesterday."
      />
      <AlertBanner
        variant="success"
        title="Batch Recipe Updated"
        description="Classic Latte portions changed from 20 to 24. All costs recalculated."
        onDismiss={() => {}}
      />
    </div>
  ),
}
