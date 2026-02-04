import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProductMixTable } from './product-mix-table'

const sampleProducts = [
  { name: 'Latte', category: 'Hot Drinks', revenue: 4523.50, quantity: 892 },
  { name: 'Americano', category: 'Hot Drinks', revenue: 3215.00, quantity: 765 },
  { name: 'Cold Brew', category: 'Cold Drinks', revenue: 2134.00, quantity: 423 },
  { name: 'Cappuccino', category: 'Hot Drinks', revenue: 1987.25, quantity: 398 },
  { name: 'Breakfast Sandwich', category: 'Food', revenue: 1876.50, quantity: 312 },
  { name: 'Croissant', category: 'Pastries', revenue: 1245.00, quantity: 415 },
  { name: 'Mocha', category: 'Hot Drinks', revenue: 1123.75, quantity: 225 },
  { name: 'Iced Latte', category: 'Cold Drinks', revenue: 987.50, quantity: 198 },
  { name: 'Blueberry Muffin', category: 'Pastries', revenue: 856.25, quantity: 285 },
  { name: 'Bagel', category: 'Food', revenue: 654.00, quantity: 218 },
]

const meta: Meta<typeof ProductMixTable> = {
  title: 'Organisms/ProductMixTable',
  component: ProductMixTable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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
  args: {
    products: sampleProducts,
  },
}

export const TopFive: Story = {
  args: {
    title: 'Top 5 Products',
    products: sampleProducts,
    maxItems: 5,
    onViewAll: () => console.log('View all clicked'),
  },
}

export const NoHeader: Story = {
  args: {
    products: sampleProducts.slice(0, 5),
    showHeader: false,
  },
}

export const CategoryBreakdown: Story = {
  args: {
    title: 'Sales by Category',
    products: [
      { name: 'Hot Drinks', revenue: 10849.50 },
      { name: 'Cold Drinks', revenue: 3121.50 },
      { name: 'Food', revenue: 2530.50 },
      { name: 'Pastries', revenue: 2101.25 },
      { name: 'Retail', revenue: 856.00 },
    ],
  },
}

export const WithQuantities: Story = {
  args: {
    products: sampleProducts.slice(0, 5),
  },
}

export const SingleProduct: Story = {
  args: {
    title: 'Best Seller',
    products: [sampleProducts[0]],
    showHeader: true,
  },
}

export const FullList: Story = {
  args: {
    title: 'All Products',
    products: sampleProducts,
  },
}
