import type { Meta, StoryObj } from '@storybook/react-vite'
import { RecipeDetail } from './recipe-detail'

const latteIngredients = [
  { name: 'Espresso', quantity: 2, unit: 'shots', cost: 0.45, linked: true },
  { name: 'Whole Milk', quantity: 8, unit: 'oz', cost: 0.32, linked: true },
  { name: 'Vanilla Syrup', quantity: 1, unit: 'pump', cost: 0.15, linked: true },
]

const muffinIngredients = [
  { name: 'All Purpose Flour', quantity: 2.5, unit: 'cups', cost: 0.85, linked: true },
  { name: 'Sugar', quantity: 0.75, unit: 'cups', cost: 0.35, linked: true },
  { name: 'Butter', quantity: 0.5, unit: 'cups', cost: 1.25, linked: true },
  { name: 'Eggs', quantity: 2, unit: 'each', cost: 0.60, linked: true },
  { name: 'Blueberries', quantity: 1.5, unit: 'cups', cost: 3.50, linked: true },
  { name: 'Vannilla Extract', quantity: 1, unit: 'tsp', cost: 0.25, linked: false },
  { name: 'Baking Powder', quantity: 2, unit: 'tsp', cost: 0.10, linked: true },
]

const sandwichIngredients = [
  { name: 'Croissant', quantity: 1, unit: 'each', cost: 0.85, linked: true },
  { name: 'Eggs', quantity: 2, unit: 'each', cost: 0.60, linked: true },
  { name: 'Chedder Cheese', quantity: 1, unit: 'slice', cost: 0.35, linked: false },
  { name: 'Bacon', quantity: 2, unit: 'strips', cost: 0.75, linked: true },
]

const meta: Meta<typeof RecipeDetail> = {
  title: 'Organisms/RecipeDetail',
  component: RecipeDetail,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[550px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Classic Latte',
    category: 'Hot Drinks',
    portions: 20,
    price: 5.50,
    ingredients: latteIngredients,
  },
}

export const WithLabor: Story = {
  args: {
    name: 'Blueberry Muffin',
    category: 'Pastries',
    portions: 12,
    price: 4.25,
    prepTime: 45,
    laborCost: 8.50,
    ingredients: muffinIngredients,
  },
}

export const WithUnlinked: Story = {
  args: {
    name: 'Breakfast Sandwich',
    category: 'Food',
    portions: 8,
    price: 8.50,
    prepTime: 15,
    laborCost: 3.75,
    ingredients: sandwichIngredients,
  },
}

export const Editable: Story = {
  args: {
    name: 'Classic Latte',
    category: 'Hot Drinks',
    portions: 20,
    price: 5.50,
    ingredients: latteIngredients,
    onEdit: () => console.log('Edit clicked'),
    onPortionsChange: (v) => console.log('Portions:', v),
    onPriceChange: (v) => console.log('Price:', v),
  },
}

export const HighMargin: Story = {
  args: {
    name: 'Drip Coffee',
    category: 'Hot Drinks',
    portions: 50,
    price: 3.00,
    ingredients: [
      { name: 'Coffee Grounds', quantity: 4, unit: 'oz', cost: 0.80, linked: true },
      { name: 'Water', quantity: 64, unit: 'oz', cost: 0.05, linked: true },
    ],
  },
}

export const LowMargin: Story = {
  args: {
    name: 'Avocado Toast',
    category: 'Food',
    portions: 6,
    price: 9.00,
    prepTime: 10,
    laborCost: 2.50,
    ingredients: [
      { name: 'Sourdough Bread', quantity: 1, unit: 'loaf', cost: 5.50, linked: true },
      { name: 'Avocados', quantity: 3, unit: 'each', cost: 6.00, linked: true },
      { name: 'Olive Oil', quantity: 2, unit: 'tbsp', cost: 0.40, linked: true },
      { name: 'Salt', quantity: 1, unit: 'tsp', cost: 0.02, linked: true },
      { name: 'Red Pepper Flakes', quantity: 1, unit: 'tsp', cost: 0.05, linked: true },
    ],
  },
}
