# Component Library Architecture

## Overview

This document outlines the architecture for migrating the monolithic `dashboard.html` to a modern React + TypeScript component library using atomic design principles.

## Recommended Stack

| Tool | Purpose |
|------|---------|
| **React 18** | UI framework with hooks |
| **TypeScript** | Type safety and better DX |
| **Tailwind CSS** | Utility-first styling (replaces inline CSS) |
| **CVA (class-variance-authority)** | Manage component variants |
| **Storybook 8** | Component development and documentation |
| **Vite** | Fast dev server and build tool |
| **TanStack Query** | Server state management (replaces manual fetch) |

## Design Tokens

Extract from current CSS variables into Tailwind config:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B2635',
          light: '#A63446',
        },
        success: '#22863a',
        warning: '#b08800',
        danger: '#cb2431',
        surface: {
          bg: '#f6f8fa',
          card: '#ffffff',
        },
        text: {
          DEFAULT: '#24292e',
          muted: '#586069',
        },
        border: '#e1e4e8',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
}
```

---

## Component Inventory (Atomic Design)

### Atoms (Foundational)

| Component | Variants | Props |
|-----------|----------|-------|
| **Button** | `primary`, `secondary`, `success`, `danger`, `ghost` | `size`, `loading`, `disabled` |
| **IconButton** | `default`, `loading` | `icon`, `title`, `disabled` |
| **Badge** | `success`, `warning`, `danger`, `live` | `pulse` (animated) |
| **Input** | `default`, `error` | `label`, `placeholder`, `type` |
| **Select** | `default` | `options`, `placeholder` |
| **Text** | `title`, `value`, `muted`, `label` | `size`, `weight`, `color` |
| **StatusDot** | `linked`, `unlinked`, `success`, `warning` | `size` |
| **Tooltip** | `top`, `bottom`, `left`, `right` | `content` |
| **Spinner** | `sm`, `md`, `lg` | - |

### Molecules (Simple Combinations)

| Component | Description | Composition |
|-----------|-------------|-------------|
| **Card** | Basic container with border/shadow | Container |
| **MetricCard** | Display a KPI with change indicator | Card + Text + Badge |
| **InfoIcon** | Icon with hover tooltip | IconButton + Tooltip |
| **EditableCell** | Table cell that becomes editable on click | Text + Input |
| **ProgressBar** | Visual progress indicator | Container + Fill |
| **BenchmarkBar** | Metric vs industry range | Label + ProgressBar + Range |
| **DebtItem** | Single debt line item | Text + Amount + Change |
| **ProductRow** | Product with rank, name, revenue | Rank + Info + Amount |
| **TeamMemberCard** | Avatar + name + role | Avatar + Text |
| **LinkItem** | Ingredient linking row | StatusDot + Text + Select + Button |
| **FormField** | Label + Input + Error | Text + Input |

### Organisms (Complex Components)

| Component | Description | Composition |
|-----------|-------------|-------------|
| **Tabs** | Tab navigation with badges | TabButton[] + Badge |
| **YearFilter** | Fiscal year pill selector | Label + PillButton[] |
| **DataTable** | Full table with sorting | Table + Header + Rows |
| **MetricGrid** | Grid of metric cards | Grid + MetricCard[] |
| **BenchmarkList** | List of benchmark comparisons | Card + BenchmarkBar[] |
| **DebtProgress** | Debt paydown tracker | Card + DebtItem[] + ProgressBar |
| **ProductMixTable** | Top products list | Card + ProductRow[] |
| **TeamGrid** | Team member display | Grid + TeamMemberCard[] |
| **RecipeDetail** | Recipe info + ingredients | Card + Form + Table |
| **Modal** | Overlay dialog | Overlay + Card + Header + Body |
| **Toast** | Notification popup | Container + Text + Icon |
| **AlertBanner** | Warning/info banner | Card + Icon + Text + Button |
| **IngredientLinkModal** | Bulk ingredient linking | Modal + LinkItem[] |

### Templates (Page Layouts)

| Template | Description |
|----------|-------------|
| **DashboardLayout** | Header + Tabs + Content area |
| **GridLayout** | Responsive grid (2, 3, 4 columns) |
| **SectionLayout** | Header + Content card |
| **TwoColumnLayout** | Side-by-side sections |

---

## Component Priority (Implementation Order)

### Phase 1: Foundation
1. Design tokens in Tailwind config
2. Button (all variants)
3. Input / Select
4. Text
5. Card
6. Badge / StatusDot
7. Tooltip
8. Spinner

### Phase 2: Data Display
1. MetricCard
2. DataTable
3. ProgressBar
4. BenchmarkBar
5. ProductRow
6. TeamMemberCard

### Phase 3: Interaction
1. Tabs
2. YearFilter (Pills)
3. EditableCell
4. Modal
5. Toast

### Phase 4: Composition
1. MetricGrid
2. BenchmarkList
3. DebtProgress
4. ProductMixTable
5. TeamGrid
6. RecipeDetail
7. AlertBanner

### Phase 5: Integration
1. DashboardLayout
2. API hooks with TanStack Query
3. Route setup (if needed)
4. Full page composition

---

## CVA Examples

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-light focus:ring-primary',
        secondary: 'bg-border text-text-muted hover:bg-gray-300 focus:ring-gray-400',
        success: 'bg-success text-white hover:bg-green-700 focus:ring-success',
        danger: 'bg-danger text-white hover:bg-red-700 focus:ring-danger',
        ghost: 'bg-transparent text-text-muted hover:bg-surface-bg border border-border',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({ variant, size, loading, children, ...props }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })} disabled={loading} {...props}>
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
```

---

## Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # Atoms
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── text.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── spinner.tsx
│   │   │   └── index.ts
│   │   ├── molecules/
│   │   │   ├── card.tsx
│   │   │   ├── metric-card.tsx
│   │   │   ├── progress-bar.tsx
│   │   │   ├── editable-cell.tsx
│   │   │   └── index.ts
│   │   ├── organisms/
│   │   │   ├── tabs.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── toast.tsx
│   │   │   └── index.ts
│   │   └── templates/
│   │       ├── dashboard-layout.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── use-summary.ts
│   │   ├── use-recipes.ts
│   │   ├── use-ingredients.ts
│   │   └── use-square-data.ts
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   └── utils.ts               # formatCurrency, etc.
│   ├── App.tsx
│   └── main.tsx
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Storybook Organization

```
stories/
├── Introduction.mdx
├── DesignTokens.mdx
├── atoms/
│   ├── Button.stories.tsx
│   ├── Input.stories.tsx
│   ├── Badge.stories.tsx
│   └── ...
├── molecules/
│   ├── Card.stories.tsx
│   ├── MetricCard.stories.tsx
│   └── ...
├── organisms/
│   ├── Tabs.stories.tsx
│   ├── DataTable.stories.tsx
│   ├── Modal.stories.tsx
│   └── ...
└── templates/
    └── DashboardLayout.stories.tsx
```

---

## API Hooks (TanStack Query)

```typescript
// hooks/use-recipes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useRecipes(sortBy = 'profit') {
  return useQuery({
    queryKey: ['recipes', sortBy],
    queryFn: () => api.get(`/api/recipes?sort_by=${sortBy}`),
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/recipes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}
```

---

## Migration Strategy

1. **Setup**: Create new `frontend/` directory with Vite + React + TypeScript + Tailwind
2. **Storybook First**: Build each component in isolation, document all variants
3. **Parallel Development**: Keep existing dashboard.html working while building new components
4. **Feature Flags**: Gradually enable new React components via feature flags
5. **Full Migration**: Once all components are tested, switch to React-based dashboard
6. **Cleanup**: Remove old dashboard.html and inline styles

---

## Next Steps

1. [ ] Initialize frontend project with Vite + React + TypeScript
2. [ ] Configure Tailwind with design tokens
3. [ ] Setup Storybook 8
4. [ ] Build Phase 1 atoms (Button, Input, Card, Badge)
5. [ ] Write stories for each component
6. [ ] Build Phase 2 molecules
7. [ ] Continue through phases
8. [ ] Integrate with FastAPI backend
9. [ ] Full migration and cleanup
