import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from './modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Text } from '@/components/ui/text'

const meta: Meta<typeof Modal> = {
  title: 'Organisms/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const ModalDemo = ({ size, children }: { size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; children?: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} size={size}>
        {children || (
          <>
            <ModalHeader onClose={() => setOpen(false)}>
              <ModalTitle>Modal Title</ModalTitle>
              <ModalDescription>This is a description of what this modal does.</ModalDescription>
            </ModalHeader>
            <ModalBody>
              <Text>Modal content goes here. You can put any content in this area.</Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Confirm</Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  )
}

export const Default: Story = {
  render: () => <ModalDemo />,
}

export const Small: Story = {
  render: () => <ModalDemo size="sm" />,
}

export const Large: Story = {
  render: () => <ModalDemo size="lg" />,
}

export const ExtraLarge: Story = {
  render: () => <ModalDemo size="xl" />,
}

export const ConfirmDelete: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>Delete Item</Button>
        <Modal open={open} onClose={() => setOpen(false)} size="sm">
          <ModalHeader onClose={() => setOpen(false)}>
            <ModalTitle>Confirm Delete</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Text>Are you sure you want to delete this item? This action cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => setOpen(false)}>Delete</Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}

export const FormModal: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Add Ingredient</Button>
        <Modal open={open} onClose={() => setOpen(false)} size="md">
          <ModalHeader onClose={() => setOpen(false)}>
            <ModalTitle>Add New Ingredient</ModalTitle>
            <ModalDescription>Enter the details for the new ingredient.</ModalDescription>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input placeholder="e.g., Butter" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select>
                  <option value="">Select category...</option>
                  <option value="dairy">Dairy</option>
                  <option value="dry">Dry Goods</option>
                  <option value="produce">Produce</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Unit Cost</label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Unit</label>
                  <Select>
                    <option value="lb">lb</option>
                    <option value="oz">oz</option>
                    <option value="each">each</option>
                  </Select>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Add Ingredient</Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}

export const LinkIngredientModal: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    const unlinkedItems = [
      { name: 'Vannilla Extract', suggestion: 'Vanilla Extract' },
      { name: 'Chedder Cheese', suggestion: 'Cheddar Cheese' },
      { name: 'Cranberrries', suggestion: 'Cranberries' },
    ]
    return (
      <>
        <Button onClick={() => setOpen(true)}>Link Ingredients</Button>
        <Modal open={open} onClose={() => setOpen(false)} size="lg">
          <ModalHeader onClose={() => setOpen(false)}>
            <ModalTitle>Link Unmatched Ingredients</ModalTitle>
            <ModalDescription>Match recipe ingredients to master ingredient list.</ModalDescription>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              {unlinkedItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-surface-bg rounded-lg">
                  <div className="flex-1">
                    <Text size="sm" weight="medium">{item.name}</Text>
                    <Text size="xs" variant="muted">Suggested: {item.suggestion}</Text>
                  </div>
                  <Select className="w-48">
                    <option value="">Select match...</option>
                    <option value="suggested">{item.suggestion}</option>
                    <option value="new">+ Create new</option>
                  </Select>
                  <Button size="sm">Link</Button>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
            <Button onClick={() => setOpen(false)}>Link All Suggested</Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}
