import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProductRow } from './product-row'

const meta: Meta<typeof ProductRow> = {
  title: 'Molecules/ProductRow',
  component: ProductRow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    rank: 1,
    name: 'Latte',
    category: 'Hot Drinks',
    revenue: 4523.50,
    quantity: 892,
    percentOfTotal: 18.5,
  },
}

export const TopThree: Story = {
  args: {
    rank: 2,
    name: 'Americano',
    category: 'Hot Drinks',
    revenue: 3215.00,
    quantity: 765,
    percentOfTotal: 13.2,
  },
}

export const LowerRank: Story = {
  args: {
    rank: 8,
    name: 'Blueberry Muffin',
    category: 'Pastries',
    revenue: 856.25,
    quantity: 152,
    percentOfTotal: 3.5,
  },
}

export const WithoutRank: Story = {
  args: {
    name: 'Cold Brew',
    category: 'Cold Drinks',
    revenue: 2134.00,
    quantity: 423,
    showRank: false,
  },
}

export const WithoutQuantity: Story = {
  args: {
    rank: 5,
    name: 'Breakfast Sandwich',
    category: 'Food',
    revenue: 1876.50,
    percentOfTotal: 7.7,
  },
}

export const ProductList: Story = {
  render: () => (
    <div className="bg-surface-card rounded-lg border border-border p-4">
      <h3 className="text-lg font-semibold mb-4">Top Products</h3>
      <ProductRow
        rank={1}
        name="Latte"
        category="Hot Drinks"
        revenue={4523.50}
        quantity={892}
        percentOfTotal={18.5}
      />
      <ProductRow
        rank={2}
        name="Americano"
        category="Hot Drinks"
        revenue={3215.00}
        quantity={765}
        percentOfTotal={13.2}
      />
      <ProductRow
        rank={3}
        name="Cold Brew"
        category="Cold Drinks"
        revenue={2134.00}
        quantity={423}
        percentOfTotal={8.7}
      />
      <ProductRow
        rank={4}
        name="Cappuccino"
        category="Hot Drinks"
        revenue={1987.25}
        quantity={398}
        percentOfTotal={8.1}
      />
      <ProductRow
        rank={5}
        name="Breakfast Sandwich"
        category="Food"
        revenue={1876.50}
        quantity={312}
        percentOfTotal={7.7}
      />
    </div>
  ),
}

export const CategoryList: Story = {
  render: () => (
    <div className="bg-surface-card rounded-lg border border-border p-4">
      <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
      <ProductRow
        name="Hot Drinks"
        revenue={12450.75}
        percentOfTotal={51.2}
        showRank={false}
      />
      <ProductRow
        name="Cold Drinks"
        revenue={5234.00}
        percentOfTotal={21.5}
        showRank={false}
      />
      <ProductRow
        name="Food"
        revenue={4123.50}
        percentOfTotal={17.0}
        showRank={false}
      />
      <ProductRow
        name="Retail"
        revenue={2508.25}
        percentOfTotal={10.3}
        showRank={false}
      />
    </div>
  ),
}
