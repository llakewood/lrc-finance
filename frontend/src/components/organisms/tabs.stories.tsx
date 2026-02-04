import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'
import { Card } from '@/components/ui/card'

const meta: Meta<typeof Tabs> = {
  title: 'Organisms/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'pills', 'underline'],
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

export const Default: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>Overview content goes here.</Card>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>Analytics content goes here.</Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>Settings content goes here.</Card>
      </TabsContent>
    </Tabs>
  ),
}

export const Pills: Story = {
  render: () => (
    <Tabs variant="pills" defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <Card>All items</Card>
      </TabsContent>
      <TabsContent value="active">
        <Card>Active items</Card>
      </TabsContent>
      <TabsContent value="completed">
        <Card>Completed items</Card>
      </TabsContent>
    </Tabs>
  ),
}

export const Underline: Story = {
  render: () => (
    <Tabs variant="underline" defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">First Tab</TabsTrigger>
        <TabsTrigger value="tab2">Second Tab</TabsTrigger>
        <TabsTrigger value="tab3">Third Tab</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <Card>First tab content</Card>
      </TabsContent>
      <TabsContent value="tab2">
        <Card>Second tab content</Card>
      </TabsContent>
      <TabsContent value="tab3">
        <Card>Third tab content</Card>
      </TabsContent>
    </Tabs>
  ),
}

export const WithBadges: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="recipes" badge={31}>
          Recipes
        </TabsTrigger>
        <TabsTrigger value="ingredients" badge={139}>
          Ingredients
        </TabsTrigger>
        <TabsTrigger value="unlinked" badge={18}>
          Unlinked
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>Dashboard overview</Card>
      </TabsContent>
      <TabsContent value="recipes">
        <Card>31 recipes loaded</Card>
      </TabsContent>
      <TabsContent value="ingredients">
        <Card>139 ingredients in database</Card>
      </TabsContent>
      <TabsContent value="unlinked">
        <Card>18 items need linking</Card>
      </TabsContent>
    </Tabs>
  ),
}

export const DashboardExample: Story = {
  render: () => (
    <Tabs defaultValue="financials">
      <TabsList>
        <TabsTrigger value="financials">Financials</TabsTrigger>
        <TabsTrigger value="square">Square Data</TabsTrigger>
        <TabsTrigger value="recipes">Recipe Costing</TabsTrigger>
      </TabsList>
      <TabsContent value="financials">
        <div className="grid grid-cols-2 gap-4">
          <Card padding="sm">Revenue metrics...</Card>
          <Card padding="sm">Expense breakdown...</Card>
        </div>
      </TabsContent>
      <TabsContent value="square">
        <div className="grid grid-cols-2 gap-4">
          <Card padding="sm">Product mix...</Card>
          <Card padding="sm">Team data...</Card>
        </div>
      </TabsContent>
      <TabsContent value="recipes">
        <Card padding="sm">Recipe costing table...</Card>
      </TabsContent>
    </Tabs>
  ),
}
