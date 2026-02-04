import * as React from 'react'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

// Sort direction icons
const SortIcon = ({ direction }: { direction?: 'asc' | 'desc' }) => (
  <svg
    className={cn(
      'w-4 h-4 ml-1 inline-block transition-transform',
      direction === 'desc' && 'rotate-180',
      !direction && 'opacity-30'
    )}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode
}

export interface DataTableProps<T extends Record<string, unknown>> extends React.HTMLAttributes<HTMLDivElement> {
  columns: Column<T>[]
  data: T[]
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string) => void
  emptyMessage?: string
  loading?: boolean
  stickyHeader?: boolean
}

function DataTableInner<T extends Record<string, unknown>>(
  {
    className,
    columns,
    data,
    sortBy,
    sortDirection,
    onSort,
    emptyMessage = 'No data available',
    loading = false,
    stickyHeader = false,
    ...props
  }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable && onSort) {
      onSort(key)
    }
  }

  return (
    <div ref={ref} className={cn('overflow-x-auto', className)} {...props}>
      <table className="w-full border-collapse">
        <thead>
          <tr className={cn(stickyHeader && 'sticky top-0 bg-surface-card z-10')}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-left border-b border-border bg-surface-bg',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.sortable && 'cursor-pointer select-none hover:bg-border/50'
                )}
                style={{ width: column.width }}
                onClick={() => handleSort(column.key, column.sortable)}
              >
                <Text as="span" size="sm" weight="semibold" variant="muted">
                  {column.header}
                  {column.sortable && (
                    <SortIcon
                      direction={sortBy === column.key ? sortDirection : undefined}
                    />
                  )}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-text-muted"
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-border last:border-b-0 hover:bg-surface-bg/50 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {column.render
                      ? column.render(row[column.key as keyof T], row, rowIndex)
                      : (row[column.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// Type-safe forwardRef wrapper
const DataTable = React.forwardRef(DataTableInner) as <T extends Record<string, unknown>>(
  props: DataTableProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement

export { DataTable }
