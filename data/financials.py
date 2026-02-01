"""
Little Red Coffee Ltd. - Financial Data
Extracted from comparative statements dated 12-14-2025
"""

from datetime import date

# Balance Sheet Data
BALANCE_SHEETS = [
    {
        "period_end": date(2025, 9, 30),
        # Current Assets
        "cash_on_hand": 200.00,
        "savings_account": 6737.77,
        "chequing_account": 3641.17,
        "total_cash": 10578.94,
        "inventory": 1445.39,
        "total_current_assets": 12024.33,
        # Capital Assets
        "leasehold_improvements": 17653.00,
        "leasehold_amortization": -12260.00,
        "net_leasehold": 5393.00,
        "furniture_equipment": 18461.48,
        "furniture_amortization": -9897.48,
        "net_furniture": 8564.00,
        "total_capital_assets": 13957.00,
        "total_assets": 25981.33,
        # Current Liabilities
        "accounts_payable": 0.00,
        "ei_payable": 37.97,
        "cpp_payable": 105.70,
        "wsib_payable": -73.49,
        "gst_hst_collected": 3900.24,
        "gst_hst_paid": -1144.10,
        "gst_hst_remittances": 2756.14,
        "total_current_liabilities": 2826.32,
        # Long Term Liabilities
        "bdc_loan": 15770.00,
        "cibc_loan": 7083.23,
        "shareholder_loan": 14424.32,
        "total_long_term_liabilities": 37277.55,
        "total_liabilities": 40103.87,
        # Equity
        "share_capital": 100.00,
        "retained_earnings_previous": -27223.12,
        "current_earnings": 13000.58,
        "total_retained_earnings": -14222.54,
        "total_equity": -14122.54,
    },
    {
        "period_end": date(2024, 9, 30),
        # Current Assets
        "cash_on_hand": 200.00,
        "savings_account": 4879.99,
        "chequing_account": 2380.53,
        "total_cash": 7460.52,
        "inventory": 1014.13,
        "total_current_assets": 8474.65,
        # Capital Assets
        "leasehold_improvements": 17653.00,
        "leasehold_amortization": -8702.00,
        "net_leasehold": 8951.00,
        "furniture_equipment": 18461.48,
        "furniture_amortization": -7756.48,
        "net_furniture": 10705.00,
        "total_capital_assets": 19656.00,
        "total_assets": 28130.65,
        # Current Liabilities
        "accounts_payable": 252.85,
        "ei_payable": 0.00,
        "cpp_payable": 0.00,
        "wsib_payable": 37.54,
        "gst_hst_collected": 3371.22,
        "gst_hst_paid": -367.78,
        "gst_hst_remittances": 3003.44,
        "total_current_liabilities": 3293.83,
        # Long Term Liabilities
        "bdc_loan": 23107.10,
        "cibc_loan": 12083.27,
        "shareholder_loan": 16769.57,
        "total_long_term_liabilities": 51959.94,
        "total_liabilities": 55253.77,
        # Equity
        "share_capital": 100.00,
        "retained_earnings_previous": -40238.71,
        "current_earnings": 13015.59,
        "total_retained_earnings": -27223.12,
        "total_equity": -27123.12,
    },
]

# Income Statement Data
INCOME_STATEMENTS = [
    {
        "period_start": date(2024, 10, 1),
        "period_end": date(2025, 9, 30),
        # Sales Revenue
        "food_beverage_sales": 117181.99,
        "tips": 8639.61,
        "non_taxable_grocery": 4483.99,
        "liquor_sales": 2672.43,
        "consignment_sales": 316.95,
        "gift_card_sales": 627.22,
        "net_sales": 133922.19,
        # Other Revenue
        "grants": 1564.00,
        "interest_revenue": 5.91,
        "total_other_revenue": 1569.91,
        "total_revenue": 135492.10,
        # COGS - Purchases
        "small_tools_supplies": 869.27,
        "inventory_beginning": 1014.13,
        "delivery_services": 2230.70,
        "freight_expense": 85.50,
        "food_beverage_purchases": 39810.44,
        "liquor_purchases": 2049.98,
        "kitchen_supplies": 4458.07,
        "consignment_purchases": 0.00,
        "inventory_end": -1445.39,
        "total_purchases": 48203.43,
        # Payroll
        "wages_salaries": 27870.39,
        "ei_expense": 351.89,
        "cpp_expense": 743.67,
        "wsib_expense": 0.00,
        "total_payroll": 28965.95,
        "total_cogs": 78038.65,
        # G&A Expenses
        "accounting_legal": 1688.00,
        "advertising": 1321.00,
        "business_fees": 412.05,
        "amortization": 5699.00,
        "insurance": 3844.14,
        "interest_bank_charges": 5710.16,
        "office_supplies": 374.37,
        "vehicle_expenses": 817.29,
        "rent": 22005.02,
        "repairs_maintenance": 1358.64,
        "telephone": 586.41,
        "travel_entertainment": 102.64,
        "utilities": 216.72,
        "cleaning_supplies": 139.69,
        "licensing": 177.74,
        "total_ga_expenses": 44452.87,
        "total_expenses": 122491.52,
        "net_income": 13000.58,
    },
    {
        "period_start": date(2023, 10, 1),
        "period_end": date(2024, 9, 30),
        # Sales Revenue
        "food_beverage_sales": 118371.48,
        "tips": 10268.58,
        "non_taxable_grocery": 4566.97,
        "liquor_sales": 2337.64,
        "consignment_sales": 490.00,
        "gift_card_sales": 485.38,
        "net_sales": 136520.05,
        # Other Revenue
        "grants": 0.00,
        "interest_revenue": 9.30,
        "total_other_revenue": 9.30,
        "total_revenue": 136529.35,
        # COGS - Purchases
        "small_tools_supplies": 175.99,
        "inventory_beginning": 1450.00,
        "delivery_services": 3391.97,
        "freight_expense": 273.99,
        "food_beverage_purchases": 40421.64,
        "liquor_purchases": 1442.37,
        "kitchen_supplies": 4786.84,
        "consignment_purchases": 557.60,
        "inventory_end": -1014.13,
        "total_purchases": 51310.28,
        # Payroll
        "wages_salaries": 31078.55,
        "ei_expense": 588.27,
        "cpp_expense": 1273.26,
        "wsib_expense": 260.60,
        "total_payroll": 33200.68,
        "total_cogs": 84686.95,
        # G&A Expenses
        "accounting_legal": 1000.00,
        "advertising": 1412.83,
        "business_fees": 257.05,
        "amortization": 6234.00,
        "insurance": 3306.50,
        "interest_bank_charges": 4431.02,
        "office_supplies": 235.74,
        "vehicle_expenses": 859.58,
        "rent": 20030.00,
        "repairs_maintenance": 149.75,
        "telephone": 592.63,
        "travel_entertainment": 145.86,
        "utilities": 0.00,
        "cleaning_supplies": 171.85,
        "licensing": 0.00,
        "total_ga_expenses": 38826.81,
        "total_expenses": 123513.76,
        "net_income": 13015.59,
    },
]

# Coffee Shop Industry Benchmarks (typical ranges)
INDUSTRY_BENCHMARKS = {
    "gross_margin_pct": {"avg": 60.0, "low": 55.0, "high": 70.0},
    "net_margin_pct": {"avg": 5.0, "low": 2.0, "high": 10.0},
    "labor_cost_pct": {"avg": 30.0, "low": 25.0, "high": 35.0},
    "rent_pct": {"avg": 10.0, "low": 6.0, "high": 15.0},
    "cogs_pct": {"avg": 35.0, "low": 28.0, "high": 40.0},
    "food_cost_pct": {"avg": 30.0, "low": 25.0, "high": 35.0},
}
