import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'

const avatarVariants = cva(
  'rounded-full flex items-center justify-center font-semibold text-white',
  {
    variants: {
      size: {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// Generate consistent color from name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-primary',
    'bg-success',
    'bg-warning',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-orange-500',
  ]
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

function getInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export interface TeamMemberCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  name: string
  role?: string
  status?: 'active' | 'inactive'
  imageUrl?: string
  compact?: boolean
}

const TeamMemberCard = React.forwardRef<HTMLDivElement, TeamMemberCardProps>(
  (
    {
      className,
      name,
      role,
      status,
      imageUrl,
      size = 'md',
      compact = false,
      ...props
    },
    ref
  ) => {
    const initials = getInitials(name)
    const avatarColor = getAvatarColor(name)

    if (compact) {
      return (
        <div
          ref={ref}
          className={cn('flex items-center gap-2', className)}
          {...props}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className={cn(avatarVariants({ size }), 'object-cover')}
            />
          ) : (
            <div className={cn(avatarVariants({ size }), avatarColor)}>
              {initials}
            </div>
          )}
          <Text size="sm" weight="medium">
            {name}
          </Text>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg bg-surface-card border border-border',
          className
        )}
        {...props}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className={cn(avatarVariants({ size }), 'object-cover')}
          />
        ) : (
          <div className={cn(avatarVariants({ size }), avatarColor)}>
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Text size="sm" weight="medium" className="truncate">
            {name}
          </Text>
          {role && (
            <Text size="xs" variant="muted" className="truncate">
              {role}
            </Text>
          )}
        </div>
        {status && (
          <Badge
            variant={status === 'active' ? 'success' : 'default'}
            size="sm"
          >
            {status}
          </Badge>
        )}
      </div>
    )
  }
)
TeamMemberCard.displayName = 'TeamMemberCard'

export { TeamMemberCard, avatarVariants }
