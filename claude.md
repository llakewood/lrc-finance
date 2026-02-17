CONTEXT:

I'm a small business owner. I own a coffee shop in a small town. It's a community hub, and we have been open for 4 years. Money is tight, but I passed a milestone of consolidating two startup loans into a single line of credit (cash flow improved).

What I really want to narrow in on is how to understand my money better. I have financial and comparative statements for you. We can do a report of staffing, and I have years of receipts in folders as well.

We should start in planning what is the best way to work together toward better understanding of my money and the shops profitability. Whether we turn out an app, or start in docs, I'm happy to start with an MVP and build from there.

This project is both analytical and prescriptive.


COMPLETED:

- [x] MVP Dashboard built (FastAPI + single-page HTML)
- [x] Parsed balance sheet & income statement (FY23-24, FY24-25)
- [x] Key metrics: revenue, net income, cash, debt tracking
- [x] Industry benchmarks comparison
- [x] Expense breakdown (COGS vs G&A)
- [x] Debt paydown progress tracker
- [x] Square API integration (live POS data)
- [x] Product mix dashboard (top sellers, categories)
- [x] Team/staffing display
- [x] Recipe Costing module - 139 ingredients & 31 recipes
- [x] Batch profit calculations (revenue = price × portions, fixes margin accuracy)
- [x] Editable ingredients with JSON persistence
- [x] Editable recipe details (portions, price, prep time, labor cost)
- [x] JSON-based storage (migrated from Excel) - data/ingredients.json, data/recipes.json
- [x] Ingredient linking - recipes link to master ingredients for auto-cost updates
- [x] Manual linking UI - modal to review/link unmatched ingredients (18 items need review)
- [x] Component library foundation (Phase 1) - React + TypeScript + Tailwind + Storybook + CVA
- [x] Component library complete (Phases 1-5) - 29 components, TanStack Query hooks, Dashboard page
- [x] React frontend feature parity with HTML template (3 tabs: Financial Overview, Live POS Data, Recipe Costing)
- [x] Recipe category system - renamed concept→category, created data/recipe-categories.json with 8 categories
- [x] Recipe table sorting - all columns sortable ASC/DESC, editable name & category
- [x] Inventory & Purchasing system (Phases 1-3):
  - Purchase tracking with supplier & invoice management
  - Supplier CRUD with contact info & lead times
  - Inventory levels with min/max stock thresholds
  - Price history tracking with automatic change detection
  - Low-stock alerts and price change alerts
  - Master ingredients consolidated into Inventory tab
- [x] Square Menu Verification:
  - Fuzzy matching (SequenceMatcher) links 31 recipes to 224 Square catalog items
  - Price comparison flags mismatches (found 9 of 18 matched items with wrong prices)
  - Backend module: data/menu_verification.py
  - API endpoint: GET /api/menu-verification (with caching, offline fallback)
  - Frontend: MenuVerification component in Recipe Costing tab
  - Hook: use-menu-verification.ts (useMenuVerification, useRefreshMenuVerification)

FRONTEND (frontend/):

Built with Vite + React 18 + TypeScript + Tailwind CSS v4 + Storybook 10

Atomic design component library with CVA variants:

Atoms (components/ui/):
- Button (7 variants, 4 sizes)
- Input (3 variants, 3 sizes)
- Select (3 variants, 3 sizes)
- Card (3 variants, 4 paddings)
- Badge (9 variants, 3 sizes)
- Text (6 variants, 7 sizes, 4 weights, polymorphic)
- Tooltip (2 variants, 4 positions)
- Spinner (4 sizes, 3 variants)
- StatusDot (7 variants, pulse animation)
- IconButton (4 variants, 3 sizes)

Molecules (components/molecules/):
- ContentCard (Card + Header/Title/Description/Content/Footer)
- MetricCard (KPI display with change indicators, tooltips)
- ProgressBar (visual progress with color variants)
- BenchmarkBar (value vs industry range comparison)
- ProductRow (ranked product display)
- TeamMemberCard (avatar with initials, status)
- DataTable (generic sortable table)
- YearFilter (fiscal year pill selector)
- EditableCell (inline edit/display toggle)

Organisms (components/organisms/):
- Tabs (default/pills/underline variants)
- Modal (dialog overlay, sizes sm-full)
- Toast (notifications with auto-dismiss)
- MetricGrid (responsive grid of MetricCards)
- BenchmarkList (industry comparisons)
- DebtProgress (debt paydown tracker)
- ProductMixTable (ranked product list)
- TeamGrid (team member cards grid)
- RecipeDetail (full recipe view with ingredients)
- AlertBanner (info/warning/success/error)
- MenuVerification (Square price verification with fuzzy matching)

Templates (components/templates/):
- DashboardLayout (main layout with header, logo, footer)
- SectionLayout (section wrapper with title, actions)
- GridLayout (responsive grid utility)

API Integration (lib/):
- api-types.ts - TypeScript interfaces for all API responses
- api.ts - API client with all endpoint functions

Hooks (hooks/):
- use-financial.ts - useFiscalYears, useSummary, useExpenseBreakdown, useBenchmarks, useDebtProgress, useMetrics, useCashFlowHealth
- use-square.ts - useSquareStatus, useSquareSales, useSquareProductMix, useSquareTeam, useRefreshSquareData
- use-recipes.ts - useRecipes, useRecipe, useUpdateRecipe, useUnlinkedIngredients, useLinkIngredient, useRecipeCategories
- use-ingredients.ts - useIngredients, useUpdateIngredient, useCreateIngredient, useDeleteIngredient, useIngredientCategories
- use-purchases.ts - usePurchases, useCreatePurchase, useUpdatePurchase, useDeletePurchase
- use-suppliers.ts - useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier
- use-inventory.ts - useInventory, useUpdateInventory, useLowStockItems, usePriceHistory, usePriceAlerts
- use-menu-verification.ts - useMenuVerification, useRefreshMenuVerification
- use-receipt-scanner.ts - useReceiptScanStatus, useScanReceipt

Pages (pages/):
- dashboard.tsx - Main dashboard with 4 tabs:
  - Financial Overview: Key metrics, profitability, benchmarks, debt progress, expense breakdown, cash flow health
  - Live POS Data: Square sales metrics, top sellers, team grid
  - Recipe Costing: Recipe summary cards, sortable profitability table, recipe detail panel, Square menu verification
  - Inventory: Master ingredients table, purchase history (with OCR scan & multi-item receipt entry), supplier management, stock levels, price alerts

To run frontend: `cd frontend && npm run dev` → http://localhost:5173
To run Storybook: `cd frontend && npm run storybook` → http://localhost:6006

BACKEND:

To run: `pip3 install -r requirements.txt && python3 run.py` → http://127.0.0.1:8000

Key backend modules:
- app/main.py - FastAPI app with all API endpoints
- app/square_client.py - Square API client (locations, orders, catalog, team, labor)
- app/config.py - Settings & environment config
- data/recipes.py - Recipe & ingredient data access (JSON-based)
- data/purchasing.py - Purchase, supplier, inventory management
- data/receipt_scanner.py - Claude Vision API receipt OCR (requires anthropic package + ANTHROPIC_API_KEY)
- data/menu_verification.py - Fuzzy matching recipes against Square catalog for price verification
- data/financials.py - Balance sheet & income statement data

REPO: https://github.com/llakewood/lrc-finance

ENVIRONMENT:

Required .env variables:
- SQUARE_ACCESS_TOKEN - Square API key for POS data
- SQUARE_LOCATION_ID - (optional) Square location, auto-detected if not set
- ANTHROPIC_API_KEY - For receipt OCR scanning (requires funded Anthropic API account with credits)


PRIORITIES:

- Increase revenue by 10% through pricing review, upselling, and traffic optimization
- Understand your product mix - identify which items are most profitable
- Build a cash buffer - target $10k-$20k (you're already halfway there!)

NEXT STEPS:

Work through the following areas to gain a broader understanding of all areas of the business.

- [x] Staffing analysis - integrated via Square API
- [x] Product mix deep-dive - integrated via Square API
- [x] Recipe costing - parse & edit recipes, calculate batch profitability
- [x] Inventory & Purchasing (Phases 1-3) - purchase tracking, suppliers, stock levels, price alerts
- [x] Multi-Item Receipt Entry (Phase 4) - enter full receipts with multiple items, HST per-item tracking
- [x] OCR Receipt Scanning (Phase 5) - Claude Vision API for receipt photo extraction (requires Anthropic API credits)
- [x] Square Menu Verification - fuzzy match recipes to Square catalog, flag price mismatches
- [ ] Scenario planning ("What if...") - build calculator for pricing/volume changes
- [ ] Monthly tracking system - lightweight system to input monthly numbers
