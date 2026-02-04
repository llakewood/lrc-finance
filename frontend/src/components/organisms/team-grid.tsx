import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { TeamMemberCard, type TeamMemberCardProps } from '@/components/molecules/team-member-card'

export interface TeamGridProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  members: Omit<TeamMemberCardProps, 'className'>[]
  columns?: 2 | 3 | 4
  showHeader?: boolean
  compact?: boolean
}

const TeamGrid = React.forwardRef<HTMLDivElement, TeamGridProps>(
  (
    {
      className,
      title = 'Team',
      members,
      columns = 2,
      showHeader = true,
      compact = false,
      ...props
    },
    ref
  ) => {
    const activeCount = members.filter((m) => m.status === 'active').length
    const gridCols = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    }

    return (
      <Card ref={ref} className={cn('', className)} {...props}>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <Text size="lg" weight="semibold">
                {title}
              </Text>
              <Text size="sm" variant="muted">
                {members.length} members
              </Text>
            </div>
            <Badge variant="success" size="sm">
              {activeCount} active
            </Badge>
          </div>
        )}

        <div className={cn('grid gap-3', gridCols[columns])}>
          {members.map((member, index) => (
            <TeamMemberCard
              key={index}
              {...member}
              compact={compact}
            />
          ))}
        </div>
      </Card>
    )
  }
)
TeamGrid.displayName = 'TeamGrid'

export { TeamGrid }
