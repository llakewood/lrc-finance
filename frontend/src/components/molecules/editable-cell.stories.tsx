import type { Meta, StoryObj } from '@storybook/react-vite'
import { EditableCell } from './editable-cell'
import { formatCurrency } from '@/lib/utils'

const meta: Meta<typeof EditableCell> = {
  title: 'Molecules/EditableCell',
  component: EditableCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'number'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 'Latte',
  },
}

export const NumberValue: Story = {
  args: {
    value: 42,
    type: 'number',
  },
}

export const WithFormat: Story = {
  args: {
    value: 5.5,
    type: 'number',
    format: (v) => formatCurrency(Number(v), { decimals: 2 }),
  },
}

export const NotEditable: Story = {
  args: {
    value: 'Read-only value',
    editable: false,
  },
}

export const InTable: Story = {
  render: () => (
    <div className="bg-surface-card rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-bg border-b border-border">
            <th className="px-4 py-2 text-left text-sm font-semibold text-text-muted">Product</th>
            <th className="px-4 py-2 text-right text-sm font-semibold text-text-muted">Price</th>
            <th className="px-4 py-2 text-right text-sm font-semibold text-text-muted">Portions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="px-4 py-2">
              <EditableCell value="Classic Latte" />
            </td>
            <td className="px-4 py-2 text-right">
              <EditableCell
                value={5.5}
                type="number"
                format={(v) => formatCurrency(Number(v), { decimals: 2 })}
              />
            </td>
            <td className="px-4 py-2 text-right">
              <EditableCell value={20} type="number" />
            </td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2">
              <EditableCell value="Vanilla Cold Brew" />
            </td>
            <td className="px-4 py-2 text-right">
              <EditableCell
                value={5.75}
                type="number"
                format={(v) => formatCurrency(Number(v), { decimals: 2 })}
              />
            </td>
            <td className="px-4 py-2 text-right">
              <EditableCell value={15} type="number" />
            </td>
          </tr>
          <tr>
            <td className="px-4 py-2">
              <EditableCell value="Blueberry Muffin" />
            </td>
            <td className="px-4 py-2 text-right">
              <EditableCell
                value={4.25}
                type="number"
                format={(v) => formatCurrency(Number(v), { decimals: 2 })}
              />
            </td>
            <td className="px-4 py-2 text-right">
              <EditableCell value={12} type="number" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
}

export const IngredientCost: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4 bg-surface-card rounded-lg border border-border">
      <span className="text-sm font-medium w-32">Butter (lb)</span>
      <EditableCell
        value={4.99}
        type="number"
        format={(v) => formatCurrency(Number(v), { decimals: 2 })}
        onSave={(v) => console.log('Saved:', v)}
      />
      <span className="text-xs text-text-muted">Click to edit</span>
    </div>
  ),
}
