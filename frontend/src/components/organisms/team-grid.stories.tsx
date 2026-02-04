import type { Meta, StoryObj } from '@storybook/react-vite'
import { TeamGrid } from './team-grid'

const teamMembers = [
  { name: 'Sarah Johnson', role: 'Barista', status: 'active' as const },
  { name: 'Mike Chen', role: 'Shift Lead', status: 'active' as const },
  { name: 'Emily Davis', role: 'Barista', status: 'active' as const },
  { name: 'Tom Wilson', role: 'Baker', status: 'inactive' as const },
  { name: 'Lisa Park', role: 'Manager', status: 'active' as const },
  { name: 'James Brown', role: 'Barista', status: 'active' as const },
]

const meta: Meta<typeof TeamGrid> = {
  title: 'Organisms/TeamGrid',
  component: TeamGrid,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [2, 3, 4],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    members: teamMembers,
  },
}

export const ThreeColumns: Story = {
  args: {
    members: teamMembers,
    columns: 3,
  },
}

export const FourColumns: Story = {
  args: {
    members: teamMembers,
    columns: 4,
  },
}

export const Compact: Story = {
  args: {
    members: teamMembers,
    compact: true,
  },
}

export const NoHeader: Story = {
  args: {
    members: teamMembers.slice(0, 4),
    showHeader: false,
  },
}

export const SmallTeam: Story = {
  args: {
    title: 'Core Team',
    members: teamMembers.slice(0, 3),
  },
}

export const AllActive: Story = {
  args: {
    title: 'Active Staff',
    members: teamMembers.filter((m) => m.status === 'active'),
  },
}

export const WithRoles: Story = {
  args: {
    title: 'Management Team',
    members: [
      { name: 'Lisa Park', role: 'General Manager', status: 'active' as const },
      { name: 'Mike Chen', role: 'Assistant Manager', status: 'active' as const },
      { name: 'Sarah Johnson', role: 'Lead Barista', status: 'active' as const },
    ],
    columns: 3,
  },
}
