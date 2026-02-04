import type { Meta, StoryObj } from '@storybook/react-vite'
import { TeamMemberCard } from './team-member-card'

const meta: Meta<typeof TeamMemberCard> = {
  title: 'Molecules/TeamMemberCard',
  component: TeamMemberCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    status: {
      control: 'select',
      options: ['active', 'inactive', undefined],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Sarah Johnson',
    role: 'Barista',
  },
}

export const WithStatus: Story = {
  args: {
    name: 'Mike Chen',
    role: 'Shift Lead',
    status: 'active',
  },
}

export const Inactive: Story = {
  args: {
    name: 'Emily Davis',
    role: 'Barista',
    status: 'inactive',
  },
}

export const Compact: Story = {
  args: {
    name: 'Sarah Johnson',
    role: 'Barista',
    compact: true,
  },
}

export const SmallAvatar: Story = {
  args: {
    name: 'Tom Wilson',
    role: 'Manager',
    size: 'sm',
  },
}

export const LargeAvatar: Story = {
  args: {
    name: 'Lisa Park',
    role: 'Owner',
    size: 'lg',
    status: 'active',
  },
}

export const TeamGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 w-[500px]">
      <TeamMemberCard name="Sarah Johnson" role="Barista" status="active" />
      <TeamMemberCard name="Mike Chen" role="Shift Lead" status="active" />
      <TeamMemberCard name="Emily Davis" role="Barista" status="active" />
      <TeamMemberCard name="Tom Wilson" role="Baker" status="inactive" />
    </div>
  ),
}

export const CompactList: Story = {
  render: () => (
    <div className="space-y-2 w-48">
      <TeamMemberCard name="Sarah Johnson" compact />
      <TeamMemberCard name="Mike Chen" compact />
      <TeamMemberCard name="Emily Davis" compact />
      <TeamMemberCard name="Tom Wilson" compact />
    </div>
  ),
}

export const AvatarColors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 w-[500px]">
      <TeamMemberCard name="Alice Brown" role="Barista" />
      <TeamMemberCard name="Bob Smith" role="Barista" />
      <TeamMemberCard name="Carol White" role="Baker" />
      <TeamMemberCard name="David Lee" role="Shift Lead" />
      <TeamMemberCard name="Eva Martinez" role="Manager" />
      <TeamMemberCard name="Frank Garcia" role="Owner" />
    </div>
  ),
}

export const ShiftSchedule: Story = {
  render: () => (
    <div className="bg-surface-card rounded-lg border border-border p-4 w-80">
      <h3 className="text-lg font-semibold mb-3">Today's Team</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <TeamMemberCard name="Sarah Johnson" compact size="sm" />
          <span className="text-xs text-text-muted">6am - 2pm</span>
        </div>
        <div className="flex items-center justify-between">
          <TeamMemberCard name="Mike Chen" compact size="sm" />
          <span className="text-xs text-text-muted">7am - 3pm</span>
        </div>
        <div className="flex items-center justify-between">
          <TeamMemberCard name="Emily Davis" compact size="sm" />
          <span className="text-xs text-text-muted">2pm - 10pm</span>
        </div>
      </div>
    </div>
  ),
}
