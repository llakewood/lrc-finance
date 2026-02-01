from pydantic import BaseModel
from typing import Optional
from datetime import date


class BalanceSheetPeriod(BaseModel):
    period_end: date

    # Current Assets
    cash_on_hand: float = 0.0
    savings_account: float = 0.0
    chequing_account: float = 0.0
    total_cash: float = 0.0
    inventory: float = 0.0
    total_current_assets: float = 0.0

    # Capital Assets
    leasehold_improvements: float = 0.0
    leasehold_amortization: float = 0.0
    net_leasehold: float = 0.0
    furniture_equipment: float = 0.0
    furniture_amortization: float = 0.0
    net_furniture: float = 0.0
    total_capital_assets: float = 0.0

    total_assets: float = 0.0

    # Current Liabilities
    accounts_payable: float = 0.0
    ei_payable: float = 0.0
    cpp_payable: float = 0.0
    wsib_payable: float = 0.0
    gst_hst_collected: float = 0.0
    gst_hst_paid: float = 0.0
    gst_hst_remittances: float = 0.0
    total_current_liabilities: float = 0.0

    # Long Term Liabilities
    bdc_loan: float = 0.0
    cibc_loan: float = 0.0
    shareholder_loan: float = 0.0
    total_long_term_liabilities: float = 0.0

    total_liabilities: float = 0.0

    # Equity
    share_capital: float = 0.0
    retained_earnings_previous: float = 0.0
    current_earnings: float = 0.0
    total_retained_earnings: float = 0.0
    total_equity: float = 0.0


class IncomeStatementPeriod(BaseModel):
    period_start: date
    period_end: date

    # Sales Revenue
    food_beverage_sales: float = 0.0
    tips: float = 0.0
    non_taxable_grocery: float = 0.0
    liquor_sales: float = 0.0
    consignment_sales: float = 0.0
    gift_card_sales: float = 0.0
    net_sales: float = 0.0

    # Other Revenue
    grants: float = 0.0
    interest_revenue: float = 0.0
    total_other_revenue: float = 0.0

    total_revenue: float = 0.0

    # Cost of Goods Sold
    small_tools_supplies: float = 0.0
    inventory_beginning: float = 0.0
    delivery_services: float = 0.0
    freight_expense: float = 0.0
    food_beverage_purchases: float = 0.0
    liquor_purchases: float = 0.0
    kitchen_supplies: float = 0.0
    consignment_purchases: float = 0.0
    inventory_end: float = 0.0
    total_purchases: float = 0.0

    # Payroll
    wages_salaries: float = 0.0
    ei_expense: float = 0.0
    cpp_expense: float = 0.0
    wsib_expense: float = 0.0
    total_payroll: float = 0.0

    total_cogs: float = 0.0

    # General & Administrative
    accounting_legal: float = 0.0
    advertising: float = 0.0
    business_fees: float = 0.0
    amortization: float = 0.0
    insurance: float = 0.0
    interest_bank_charges: float = 0.0
    office_supplies: float = 0.0
    vehicle_expenses: float = 0.0
    rent: float = 0.0
    repairs_maintenance: float = 0.0
    telephone: float = 0.0
    travel_entertainment: float = 0.0
    utilities: float = 0.0
    cleaning_supplies: float = 0.0
    licensing: float = 0.0
    total_ga_expenses: float = 0.0

    total_expenses: float = 0.0
    net_income: float = 0.0


class FinancialData(BaseModel):
    business_name: str = "Little Red Coffee Ltd."
    balance_sheets: list[BalanceSheetPeriod] = []
    income_statements: list[IncomeStatementPeriod] = []


class FinancialMetrics(BaseModel):
    """Calculated metrics for analysis"""
    period_label: str

    # Profitability
    gross_profit: float
    gross_margin_pct: float
    net_margin_pct: float

    # Efficiency
    cogs_pct: float
    labor_cost_pct: float
    rent_pct: float

    # Liquidity
    current_ratio: Optional[float] = None
    cash_to_current_liabilities: Optional[float] = None

    # Debt
    debt_to_equity: Optional[float] = None
    total_debt: float = 0.0


class IndustryBenchmark(BaseModel):
    metric: str
    your_value: float
    industry_avg: float
    industry_range_low: float
    industry_range_high: float
    status: str  # "good", "warning", "concern"
