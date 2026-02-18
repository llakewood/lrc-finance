"""
Little Red Coffee Ltd. - Financial Dashboard API

Pure accounting/financial endpoints. Operational code (recipes, inventory,
purchasing, Square POS, receipt scanning) has been migrated to lrc-operations.
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import Request
from pathlib import Path
from datetime import date
import sys

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models import (
    BalanceSheetPeriod,
    IncomeStatementPeriod,
    FinancialMetrics,
    IndustryBenchmark,
)
from data.financials import BALANCE_SHEETS, INCOME_STATEMENTS, INDUSTRY_BENCHMARKS


app = FastAPI(
    title="Little Red Coffee - Financial Dashboard",
    description="Financial analysis and insights for Little Red Coffee Ltd.",
    version="0.1.0",
)

# Mount static files and templates
BASE_DIR = Path(__file__).parent.parent
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


def calculate_metrics(income: dict, balance: dict | None = None) -> dict:
    """Calculate financial metrics from raw data"""
    revenue = income["total_revenue"]
    net_sales = income["net_sales"]
    cogs = income["total_cogs"]
    purchases = income["total_purchases"]
    payroll = income["total_payroll"]
    rent = income["rent"]
    net_income = income["net_income"]

    gross_profit = revenue - cogs
    gross_margin = (gross_profit / revenue * 100) if revenue else 0
    net_margin = (net_income / revenue * 100) if revenue else 0
    cogs_pct = (cogs / revenue * 100) if revenue else 0
    labor_pct = (payroll / revenue * 100) if revenue else 0
    rent_pct = (rent / revenue * 100) if revenue else 0
    food_cost_pct = (purchases / net_sales * 100) if net_sales else 0

    metrics = {
        "gross_profit": round(gross_profit, 2),
        "gross_margin_pct": round(gross_margin, 1),
        "net_margin_pct": round(net_margin, 1),
        "cogs_pct": round(cogs_pct, 1),
        "labor_cost_pct": round(labor_pct, 1),
        "rent_pct": round(rent_pct, 1),
        "food_cost_pct": round(food_cost_pct, 1),
    }

    if balance:
        current_assets = balance["total_current_assets"]
        current_liabilities = balance["total_current_liabilities"]
        total_cash = balance["total_cash"]
        total_liabilities = balance["total_liabilities"]
        total_equity = balance["total_equity"]

        metrics["current_ratio"] = (
            round(current_assets / current_liabilities, 2)
            if current_liabilities
            else None
        )
        metrics["cash_ratio"] = (
            round(total_cash / current_liabilities, 2) if current_liabilities else None
        )
        metrics["debt_to_equity"] = (
            round(abs(total_liabilities / total_equity), 2) if total_equity else None
        )
        metrics["total_debt"] = total_liabilities

    return metrics


def get_benchmark_status(value: float, benchmark: dict) -> str:
    """Determine if a metric is good, warning, or concern"""
    if benchmark["low"] <= value <= benchmark["high"]:
        return "good"
    elif value < benchmark["low"] * 0.8 or value > benchmark["high"] * 1.2:
        return "concern"
    return "warning"


def get_fiscal_year_label(period_end: date) -> str:
    """Get fiscal year label like 'FY24-25' from period end date (Sep 30)"""
    # Fiscal year ends in September, so FY24-25 ends Sep 30, 2025
    end_year = period_end.year
    start_year = end_year - 1
    return f"FY{str(start_year)[-2:]}-{str(end_year)[-2:]}"


def get_period_by_year(statements: list, year_label: str) -> dict | None:
    """Find a statement by fiscal year label"""
    for stmt in statements:
        if get_fiscal_year_label(stmt["period_end"]) == year_label:
            return stmt
    return None


def get_available_fiscal_years() -> list[dict]:
    """Get list of available fiscal years from data"""
    years = []
    for i, stmt in enumerate(INCOME_STATEMENTS):
        label = get_fiscal_year_label(stmt["period_end"])
        years.append({
            "label": label,
            "period_start": stmt["period_start"].isoformat(),
            "period_end": stmt["period_end"].isoformat(),
            "is_current": i == 0,
        })
    return years


# =============================================================================
# API ENDPOINTS
# =============================================================================


@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard view"""
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/api/fiscal-years")
async def get_fiscal_years():
    """Get available fiscal years for filtering"""
    return {"fiscal_years": get_available_fiscal_years()}


@app.get("/api/summary")
async def get_summary(
    year: str = Query(default=None, description="Fiscal year label (e.g., FY24-25)")
):
    """Get high-level financial summary"""
    # Find the requested year or default to most recent
    if year:
        current_income = get_period_by_year(INCOME_STATEMENTS, year)
        current_balance = get_period_by_year(BALANCE_SHEETS, year)
        if not current_income or not current_balance:
            raise HTTPException(status_code=404, detail=f"Fiscal year {year} not found")
        # Find the index to get previous year
        current_idx = INCOME_STATEMENTS.index(current_income)
    else:
        current_income = INCOME_STATEMENTS[0]
        current_balance = BALANCE_SHEETS[0]
        current_idx = 0

    # Get previous year for comparison (if available)
    previous_idx = current_idx + 1
    has_previous = previous_idx < len(INCOME_STATEMENTS)

    if has_previous:
        previous_income = INCOME_STATEMENTS[previous_idx]
        previous_balance = BALANCE_SHEETS[previous_idx]

        # Calculate YoY changes
        revenue_change = current_income["total_revenue"] - previous_income["total_revenue"]
        revenue_change_pct = (revenue_change / previous_income["total_revenue"]) * 100
        net_income_change = current_income["net_income"] - previous_income["net_income"]
        debt_change = current_balance["total_liabilities"] - previous_balance["total_liabilities"]
        cash_change = current_balance["total_cash"] - previous_balance["total_cash"]
    else:
        revenue_change = 0
        revenue_change_pct = 0
        net_income_change = 0
        debt_change = 0
        cash_change = 0

    current_fy = get_fiscal_year_label(current_income["period_end"])

    return {
        "business_name": "Little Red Coffee Ltd.",
        "current_period": current_fy,
        "previous_period": get_fiscal_year_label(INCOME_STATEMENTS[previous_idx]["period_end"]) if has_previous else None,
        "has_comparison": has_previous,
        "current": {
            "total_revenue": current_income["total_revenue"],
            "net_income": current_income["net_income"],
            "total_debt": current_balance["total_liabilities"],
            "cash": current_balance["total_cash"],
            "equity": current_balance["total_equity"],
        },
        "changes": {
            "revenue": round(revenue_change, 2),
            "revenue_pct": round(revenue_change_pct, 1),
            "net_income": round(net_income_change, 2),
            "debt": round(debt_change, 2),
            "cash": round(cash_change, 2),
        },
    }


@app.get("/api/income-statements")
async def get_income_statements():
    """Get all income statement data"""
    return {
        "periods": [
            {
                "label": f"FY {stmt['period_start'].year}-{stmt['period_end'].year}",
                **stmt,
                "period_start": stmt["period_start"].isoformat(),
                "period_end": stmt["period_end"].isoformat(),
            }
            for stmt in INCOME_STATEMENTS
        ]
    }


@app.get("/api/balance-sheets")
async def get_balance_sheets():
    """Get all balance sheet data"""
    return {
        "periods": [
            {
                "label": f"As at {sheet['period_end'].strftime('%b %d, %Y')}",
                **sheet,
                "period_end": sheet["period_end"].isoformat(),
            }
            for sheet in BALANCE_SHEETS
        ]
    }


@app.get("/api/metrics")
async def get_metrics(
    year: str = Query(default=None, description="Fiscal year label (e.g., FY24-25)")
):
    """Get calculated financial metrics for a specific or all periods"""
    if year:
        income = get_period_by_year(INCOME_STATEMENTS, year)
        balance = get_period_by_year(BALANCE_SHEETS, year)
        if not income:
            raise HTTPException(status_code=404, detail=f"Fiscal year {year} not found")
        metrics = calculate_metrics(income, balance)
        metrics["period_label"] = get_fiscal_year_label(income["period_end"])
        return {"periods": [metrics]}

    results = []
    for i, income in enumerate(INCOME_STATEMENTS):
        balance = BALANCE_SHEETS[i] if i < len(BALANCE_SHEETS) else None
        metrics = calculate_metrics(income, balance)
        metrics["period_label"] = get_fiscal_year_label(income["period_end"])
        results.append(metrics)
    return {"periods": results}


@app.get("/api/expense-breakdown")
async def get_expense_breakdown(
    year: str = Query(default=None, description="Fiscal year label (e.g., FY24-25)")
):
    """Get detailed expense breakdown"""
    if year:
        current = get_period_by_year(INCOME_STATEMENTS, year)
        if not current:
            raise HTTPException(status_code=404, detail=f"Fiscal year {year} not found")
        current_idx = INCOME_STATEMENTS.index(current)
    else:
        current = INCOME_STATEMENTS[0]
        current_idx = 0

    previous_idx = current_idx + 1
    has_previous = previous_idx < len(INCOME_STATEMENTS)
    previous = INCOME_STATEMENTS[previous_idx] if has_previous else None

    def build_breakdown(stmt):
        total = stmt["total_expenses"]
        return {
            "cogs": {
                "purchases": stmt["total_purchases"],
                "payroll": stmt["total_payroll"],
                "total": stmt["total_cogs"],
                "pct_of_total": round(stmt["total_cogs"] / total * 100, 1),
            },
            "ga": {
                "rent": stmt["rent"],
                "interest_bank": stmt["interest_bank_charges"],
                "amortization": stmt["amortization"],
                "insurance": stmt["insurance"],
                "accounting": stmt["accounting_legal"],
                "advertising": stmt["advertising"],
                "repairs": stmt["repairs_maintenance"],
                "vehicle": stmt["vehicle_expenses"],
                "telephone": stmt["telephone"],
                "other": (
                    stmt["business_fees"]
                    + stmt["office_supplies"]
                    + stmt["travel_entertainment"]
                    + stmt["utilities"]
                    + stmt["cleaning_supplies"]
                    + stmt["licensing"]
                ),
                "total": stmt["total_ga_expenses"],
                "pct_of_total": round(stmt["total_ga_expenses"] / total * 100, 1),
            },
            "total_expenses": total,
        }

    result = {
        "current": {
            "period": get_fiscal_year_label(current["period_end"]),
            **build_breakdown(current),
        },
        "has_comparison": has_previous,
    }

    if has_previous:
        result["previous"] = {
            "period": get_fiscal_year_label(previous["period_end"]),
            **build_breakdown(previous),
        }

    return result


@app.get("/api/benchmarks")
async def get_benchmarks(
    year: str = Query(default=None, description="Fiscal year label (e.g., FY24-25)")
):
    """Compare your metrics against industry benchmarks"""
    if year:
        current_income = get_period_by_year(INCOME_STATEMENTS, year)
        current_balance = get_period_by_year(BALANCE_SHEETS, year)
        if not current_income:
            raise HTTPException(status_code=404, detail=f"Fiscal year {year} not found")
    else:
        current_income = INCOME_STATEMENTS[0]
        current_balance = BALANCE_SHEETS[0]

    metrics = calculate_metrics(current_income, current_balance)

    benchmarks = []

    benchmark_map = {
        "gross_margin_pct": ("Gross Margin", "%"),
        "net_margin_pct": ("Net Margin", "%"),
        "labor_cost_pct": ("Labor Cost", "%"),
        "rent_pct": ("Rent", "%"),
        "food_cost_pct": ("Food Cost (COGS)", "%"),
    }

    for key, (name, unit) in benchmark_map.items():
        if key in INDUSTRY_BENCHMARKS and key in metrics:
            bench = INDUSTRY_BENCHMARKS[key]
            value = metrics[key]
            benchmarks.append(
                {
                    "metric": name,
                    "unit": unit,
                    "your_value": value,
                    "industry_avg": bench["avg"],
                    "industry_low": bench["low"],
                    "industry_high": bench["high"],
                    "status": get_benchmark_status(value, bench),
                }
            )

    return {"benchmarks": benchmarks}


@app.get("/api/debt-progress")
async def get_debt_progress(
    year: str = Query(default=None, description="Fiscal year label (e.g., FY24-25)")
):
    """Track debt paydown progress"""
    if year:
        current = get_period_by_year(BALANCE_SHEETS, year)
        if not current:
            raise HTTPException(status_code=404, detail=f"Fiscal year {year} not found")
        current_idx = BALANCE_SHEETS.index(current)
    else:
        current = BALANCE_SHEETS[0]
        current_idx = 0

    previous_idx = current_idx + 1
    has_previous = previous_idx < len(BALANCE_SHEETS)
    previous = BALANCE_SHEETS[previous_idx] if has_previous else None

    loans = [
        {
            "name": "BDC Loan",
            "current": current["bdc_loan"],
            "previous": previous["bdc_loan"] if has_previous else 0,
            "paid_down": (previous["bdc_loan"] - current["bdc_loan"]) if has_previous else 0,
        },
        {
            "name": "CIBC Future Entrepreneur",
            "current": current["cibc_loan"],
            "previous": previous["cibc_loan"] if has_previous else 0,
            "paid_down": (previous["cibc_loan"] - current["cibc_loan"]) if has_previous else 0,
        },
        {
            "name": "Shareholder Loan",
            "current": current["shareholder_loan"],
            "previous": previous["shareholder_loan"] if has_previous else 0,
            "paid_down": (previous["shareholder_loan"] - current["shareholder_loan"]) if has_previous else 0,
        },
    ]

    total_current = sum(loan["current"] for loan in loans)
    total_previous = sum(loan["previous"] for loan in loans)

    return {
        "loans": loans,
        "total_current": total_current,
        "total_previous": total_previous,
        "total_paid_down": total_previous - total_current,
        "equity_current": current["total_equity"],
        "equity_previous": previous["total_equity"] if has_previous else 0,
        "equity_improvement": (current["total_equity"] - previous["total_equity"]) if has_previous else 0,
        "has_comparison": has_previous,
    }


@app.get("/api/cash-flow-health")
async def get_cash_flow_health(
    year: str = Query(default=None, description="Fiscal year label (e.g., FY24-25)")
):
    """Analyze cash flow and liquidity"""
    if year:
        current_balance = get_period_by_year(BALANCE_SHEETS, year)
        current_income = get_period_by_year(INCOME_STATEMENTS, year)
        if not current_balance or not current_income:
            raise HTTPException(status_code=404, detail=f"Fiscal year {year} not found")
        current_idx = BALANCE_SHEETS.index(current_balance)
    else:
        current_balance = BALANCE_SHEETS[0]
        current_income = INCOME_STATEMENTS[0]
        current_idx = 0

    previous_idx = current_idx + 1
    has_previous = previous_idx < len(BALANCE_SHEETS)
    previous_balance = BALANCE_SHEETS[previous_idx] if has_previous else None

    monthly_revenue = current_income["total_revenue"] / 12
    monthly_expenses = current_income["total_expenses"] / 12
    monthly_net = current_income["net_income"] / 12

    cash_runway_months = (
        current_balance["total_cash"] / monthly_expenses if monthly_expenses else 0
    )

    return {
        "cash": {
            "current": current_balance["total_cash"],
            "previous": previous_balance["total_cash"] if has_previous else 0,
            "change": (current_balance["total_cash"] - previous_balance["total_cash"]) if has_previous else 0,
        },
        "monthly_averages": {
            "revenue": round(monthly_revenue, 2),
            "expenses": round(monthly_expenses, 2),
            "net_income": round(monthly_net, 2),
        },
        "liquidity": {
            "current_ratio": round(
                current_balance["total_current_assets"]
                / current_balance["total_current_liabilities"],
                2,
            ),
            "cash_runway_months": round(cash_runway_months, 1),
        },
        "has_comparison": has_previous,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
