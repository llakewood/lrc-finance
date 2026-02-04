import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { IconButton } from '@/components/ui/icon-button'

const EditIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export interface EditableCellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string | number
  onSave?: (value: string) => void
  type?: 'text' | 'number'
  format?: (value: string | number) => string
  editable?: boolean
  inputClassName?: string
}

const EditableCell = React.forwardRef<HTMLDivElement, EditableCellProps>(
  (
    {
      className,
      value,
      onSave,
      type = 'text',
      format,
      editable = true,
      inputClassName,
      ...props
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = React.useState(false)
    const [editValue, setEditValue] = React.useState(String(value))
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      setEditValue(String(value))
    }, [value])

    React.useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, [isEditing])

    const handleSave = () => {
      onSave?.(editValue)
      setIsEditing(false)
    }

    const handleCancel = () => {
      setEditValue(String(value))
      setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave()
      } else if (e.key === 'Escape') {
        handleCancel()
      }
    }

    const displayValue = format ? format(value) : String(value)

    if (isEditing) {
      return (
        <div ref={ref} className={cn('flex items-center gap-1', className)} {...props}>
          <Input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            inputSize="sm"
            className={cn('w-24', inputClassName)}
          />
          <IconButton
            icon={<CheckIcon />}
            size="sm"
            variant="ghost"
            title="Save"
            onClick={handleSave}
          />
          <IconButton
            icon={<XIcon />}
            size="sm"
            variant="ghost"
            title="Cancel"
            onClick={handleCancel}
          />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1 group', className)}
        {...props}
      >
        <Text size="sm">{displayValue}</Text>
        {editable && (
          <IconButton
            icon={<EditIcon />}
            size="sm"
            variant="ghost"
            title="Edit"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsEditing(true)}
          />
        )}
      </div>
    )
  }
)
EditableCell.displayName = 'EditableCell'

export { EditableCell }
