import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable, type Column } from './data-table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface Product {
  name: string
  category: string
  price: number
  quantity: number
  revenue: number
}

interface Recipe {
  name: string
  portions: number
  cost: number
  price: number
  margin: number
  status: 'linked' | 'unlinked'
}

const productData: Product[] = [
  { name: 'Latte', category: 'Hot Drinks', price: 5.50, quantity: 892, revenue: 4906.00 },
  { name: 'Americano', category: 'Hot Drinks', price: 4.00, quantity: 765, revenue: 3060.00 },
  { name: 'Cold Brew', category: 'Cold Drinks', price: 5.00, quantity: 423, revenue: 2115.00 },
  { name: 'Cappuccino', category: 'Hot Drinks', price: 5.50, quantity: 398, revenue: 2189.00 },
  { name: 'Croissant', category: 'Pastries', price: 4.25, quantity: 312, revenue: 1326.00 },
]

const recipeData: Recipe[] = [
  { name: 'Classic Latte', portions: 20, cost: 12.50, price: 5.50, margin: 77.3, status: 'linked' },
  { name: 'Vanilla Cold Brew', portions: 15, cost: 8.25, price: 5.75, margin: 81.4, status: 'linked' },
  { name: 'Blueberry Muffin', portions: 12, cost: 15.60, price: 4.25, margin: 69.4, status: 'unlinked' },
  { name: 'Breakfast Sandwich', portions: 8, cost: 18.40, price: 8.50, margin: 73.0, status: 'linked' },
]

const productColumns: Column<Product>[] = [
  { key: 'name', header: 'Product', sortable: true },
  { key: 'category', header: 'Category', sortable: true },
  {
    key: 'price',
    header: 'Price',
    align: 'right',
    sortable: true,
    render: (value) => formatCurrency(value as number, { decimals: 2 }),
  },
  {
    key: 'quantity',
    header: 'Sold',
    align: 'right',
    sortable: true,
    render: (value) => (value as number).toLocaleString(),
  },
  {
    key: 'revenue',
    header: 'Revenue',
    align: 'right',
    sortable: true,
    render: (value) => formatCurrency(value as number),
  },
]

const recipeColumns: Column<Recipe>[] = [
  { key: 'name', header: 'Recipe', sortable: true },
  { key: 'portions', header: 'Portions', align: 'right' },
  {
    key: 'cost',
    header: 'Batch Cost',
    align: 'right',
    render: (value) => formatCurrency(value as number, { decimals: 2 }),
  },
  {
    key: 'price',
    header: 'Price',
    align: 'right',
    render: (value) => formatCurrency(value as number, { decimals: 2 }),
  },
  {
    key: 'margin',
    header: 'Margin',
    align: 'right',
    sortable: true,
    render: (value) => `${(value as number).toFixed(1)}%`,
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (value) => (
      <Badge variant={value === 'linked' ? 'success' : 'warning'} size="sm">
        {value as string}
      </Badge>
    ),
  },
]

const meta: Meta<typeof DataTable<Product>> = {
  title: 'Molecules/DataTable',
  component: DataTable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    columns: productColumns,
    data: productData,
  },
}

export const WithSorting: Story = {
  args: {
    columns: productColumns,
    data: productData,
    sortBy: 'revenue',
    sortDirection: 'desc',
  },
}

export const Empty: Story = {
  args: {
    columns: productColumns,
    data: [],
    emptyMessage: 'No products found',
  },
}

export const Loading: Story = {
  args: {
    columns: productColumns,
    data: [],
    loading: true,
  },
}

export const RecipeTable: Story = {
  render: () => (
    <DataTable<Recipe>
      columns={recipeColumns}
      data={recipeData}
      sortBy="margin"
      sortDirection="desc"
    />
  ),
}

export const InCard: Story = {
  render: () => (
    <div className="bg-surface-card rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold">Top Products</h3>
      </div>
      <DataTable<Product>
        columns={productColumns}
        data={productData}
      />
    </div>
  ),
}

export const StickyHeader: Story = {
  render: () => (
    <div className="h-48 overflow-auto border border-border rounded-lg">
      <DataTable<Product>
        columns={productColumns}
        data={[...productData, ...productData, ...productData]}
        stickyHeader
      />
    </div>
  ),
}
