import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toast, ToastContainer } from './toast'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof Toast> = {
  title: 'Organisms/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning', 'info'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Notification',
    description: 'This is a default toast notification.',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success!',
    description: 'Your changes have been saved successfully.',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    description: 'Something went wrong. Please try again.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    description: '18 ingredients are not linked to master list.',
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    description: 'A new version is available.',
  },
}

export const WithClose: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true)
    return visible ? (
      <Toast
        variant="success"
        title="Saved!"
        description="Recipe updated successfully."
        onClose={() => setVisible(false)}
        duration={0}
      />
    ) : (
      <Button onClick={() => setVisible(true)}>Show Toast</Button>
    )
  },
}

export const TitleOnly: Story = {
  args: {
    variant: 'success',
    title: 'Changes saved!',
  },
}

export const NoIcon: Story = {
  args: {
    variant: 'info',
    title: 'Note',
    description: 'This toast has no icon.',
    showIcon: false,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <Toast variant="default" title="Default" description="Default notification." />
      <Toast variant="success" title="Success" description="Operation completed." />
      <Toast variant="error" title="Error" description="Something went wrong." />
      <Toast variant="warning" title="Warning" description="Please review." />
      <Toast variant="info" title="Info" description="For your information." />
    </div>
  ),
}

export const ToastDemo: Story = {
  render: () => {
    const [toasts, setToasts] = React.useState<Array<{ id: number; variant: 'success' | 'error' | 'warning' | 'info'; title: string }>>([])
    let nextId = 0

    const addToast = (variant: 'success' | 'error' | 'warning' | 'info', title: string) => {
      const id = nextId++
      setToasts((prev) => [...prev, { id, variant, title }])
    }

    const removeToast = (id: number) => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    return (
      <div className="relative h-64">
        <div className="flex gap-2">
          <Button variant="success" onClick={() => addToast('success', 'Saved!')}>
            Success
          </Button>
          <Button variant="danger" onClick={() => addToast('error', 'Error!')}>
            Error
          </Button>
          <Button variant="warning" onClick={() => addToast('warning', 'Warning!')}>
            Warning
          </Button>
          <Button onClick={() => addToast('info', 'Info!')}>
            Info
          </Button>
        </div>
        <ToastContainer position="bottom-right" className="absolute">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              variant={toast.variant}
              title={toast.title}
              onClose={() => removeToast(toast.id)}
              duration={3000}
            />
          ))}
        </ToastContainer>
      </div>
    )
  },
}

export const Positioned: Story = {
  render: () => (
    <div className="relative w-[600px] h-[300px] bg-surface-bg rounded-lg border border-border">
      <ToastContainer position="top-right">
        <Toast variant="success" title="Top Right" duration={0} />
      </ToastContainer>
      <ToastContainer position="bottom-left">
        <Toast variant="info" title="Bottom Left" duration={0} />
      </ToastContainer>
    </div>
  ),
}

export const RealWorldExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <Toast
        variant="success"
        title="Ingredient Updated"
        description="Butter price changed from $4.50 to $4.99"
      />
      <Toast
        variant="warning"
        title="Unlinked Ingredients"
        description="18 recipe ingredients need to be linked to master list."
      />
      <Toast
        variant="error"
        title="Save Failed"
        description="Could not save recipe. Please check your connection."
      />
      <Toast
        variant="info"
        title="Recalculating..."
        description="Updating recipe costs with new ingredient prices."
      />
    </div>
  ),
}
