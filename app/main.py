"""
Little Red Coffee Ltd. - Financial Dashboard API
"""

from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional
import sys

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models import (
    BalanceSheetPeriod,
    IncomeStatementPeriod,
    FinancialMetrics,
    IndustryBenchmark,
)
from app.config import is_square_configured
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


# =============================================================================
# API ENDPOINTS
# =============================================================================


@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard view"""
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/api/summary")
async def get_summary():
    """Get high-level financial summary"""
    current_income = INCOME_STATEMENTS[0]
    previous_income = INCOME_STATEMENTS[1]
    current_balance = BALANCE_SHEETS[0]
    previous_balance = BALANCE_SHEETS[1]

    # Calculate YoY changes
    revenue_change = current_income["total_revenue"] - previous_income["total_revenue"]
    revenue_change_pct = (revenue_change / previous_income["total_revenue"]) * 100

    net_income_change = current_income["net_income"] - previous_income["net_income"]

    debt_change = (
        current_balance["total_liabilities"] - previous_balance["total_liabilities"]
    )

    cash_change = current_balance["total_cash"] - previous_balance["total_cash"]

    return {
        "business_name": "Little Red Coffee Ltd.",
        "current_period": f"FY {current_income['period_start'].year}-{current_income['period_end'].year}",
        "previous_period": f"FY {previous_income['period_start'].year}-{previous_income['period_end'].year}",
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
async def get_metrics():
    """Get calculated financial metrics for all periods"""
    results = []
    for i, income in enumerate(INCOME_STATEMENTS):
        balance = BALANCE_SHEETS[i] if i < len(BALANCE_SHEETS) else None
        metrics = calculate_metrics(income, balance)
        metrics["period_label"] = (
            f"FY {income['period_start'].year}-{income['period_end'].year}"
        )
        results.append(metrics)
    return {"periods": results}


@app.get("/api/expense-breakdown")
async def get_expense_breakdown():
    """Get detailed expense breakdown"""
    current = INCOME_STATEMENTS[0]
    previous = INCOME_STATEMENTS[1]

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

    return {
        "current": {
            "period": f"FY {current['period_start'].year}-{current['period_end'].year}",
            **build_breakdown(current),
        },
        "previous": {
            "period": f"FY {previous['period_start'].year}-{previous['period_end'].year}",
            **build_breakdown(previous),
        },
    }


@app.get("/api/benchmarks")
async def get_benchmarks():
    """Compare your metrics against industry benchmarks"""
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
async def get_debt_progress():
    """Track debt paydown progress"""
    current = BALANCE_SHEETS[0]
    previous = BALANCE_SHEETS[1]

    loans = [
        {
            "name": "BDC Loan",
            "current": current["bdc_loan"],
            "previous": previous["bdc_loan"],
            "paid_down": previous["bdc_loan"] - current["bdc_loan"],
        },
        {
            "name": "CIBC Future Entrepreneur",
            "current": current["cibc_loan"],
            "previous": previous["cibc_loan"],
            "paid_down": previous["cibc_loan"] - current["cibc_loan"],
        },
        {
            "name": "Shareholder Loan",
            "current": current["shareholder_loan"],
            "previous": previous["shareholder_loan"],
            "paid_down": previous["shareholder_loan"] - current["shareholder_loan"],
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
        "equity_previous": previous["total_equity"],
        "equity_improvement": current["total_equity"] - previous["total_equity"],
    }


@app.get("/api/cash-flow-health")
async def get_cash_flow_health():
    """Analyze cash flow and liquidity"""
    current_balance = BALANCE_SHEETS[0]
    previous_balance = BALANCE_SHEETS[1]
    current_income = INCOME_STATEMENTS[0]

    monthly_revenue = current_income["total_revenue"] / 12
    monthly_expenses = current_income["total_expenses"] / 12
    monthly_net = current_income["net_income"] / 12

    cash_runway_months = (
        current_balance["total_cash"] / monthly_expenses if monthly_expenses else 0
    )

    return {
        "cash": {
            "current": current_balance["total_cash"],
            "previous": previous_balance["total_cash"],
            "change": current_balance["total_cash"] - previous_balance["total_cash"],
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
    }


# =============================================================================
# SQUARE API ENDPOINTS
# =============================================================================


@app.get("/api/square/status")
async def get_square_status():
    """Check if Square API is configured and connected"""
    if not is_square_configured():
        return {"configured": False, "message": "Square API not configured. Add SQUARE_ACCESS_TOKEN to .env"}

    try:
        from app.square_client import get_square_api
        api = get_square_api()
        locations = api.get_locations()
        return {
            "configured": True,
            "connected": True,
            "locations": [{"id": loc["id"], "name": loc.get("name", "Unknown")} for loc in locations],
        }
    except Exception as e:
        return {"configured": True, "connected": False, "error": str(e)}


@app.get("/api/square/labor")
async def get_labor_data(
    days: int = Query(default=30, ge=1, le=365, description="Number of days to look back"),
):
    """Get labor/staffing data from Square"""
    if not is_square_configured():
        raise HTTPException(status_code=400, detail="Square API not configured")

    try:
        from app.square_client import get_square_api
        api = get_square_api()

        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        return api.get_labor_summary(start_date, end_date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/square/product-mix")
async def get_product_mix_data(
    days: int = Query(default=30, ge=1, le=365, description="Number of days to look back"),
):
    """Get product mix analysis from Square orders"""
    if not is_square_configured():
        raise HTTPException(status_code=400, detail="Square API not configured")

    try:
        from app.square_client import get_square_api
        api = get_square_api()

        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        return api.get_product_mix(start_date, end_date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/square/sales")
async def get_sales_data(
    days: int = Query(default=30, ge=1, le=365, description="Number of days to look back"),
    group_by: str = Query(default="day", regex="^(day|week|month)$"),
):
    """Get sales data grouped by period"""
    if not is_square_configured():
        raise HTTPException(status_code=400, detail="Square API not configured")

    try:
        from app.square_client import get_square_api
        api = get_square_api()

        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        return {"sales": api.get_sales_by_period(start_date, end_date, group_by)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/square/team")
async def get_team_data():
    """Get team member data from Square"""
    if not is_square_configured():
        raise HTTPException(status_code=400, detail="Square API not configured")

    try:
        from app.square_client import get_square_api
        api = get_square_api()

        team_members = api.get_team_members()
        jobs = api.get_jobs()

        return {
            "team_members": [
                {
                    "id": tm["id"],
                    "name": f"{tm.get('given_name', '')} {tm.get('family_name', '')}".strip(),
                    "email": tm.get("email_address"),
                    "status": tm.get("status"),
                }
                for tm in team_members
            ],
            "jobs": [
                {
                    "id": job["id"],
                    "title": job.get("title", "Unknown"),
                    "hourly_rate": job.get("hourly_rate", {}).get("amount", 0) / 100 if job.get("hourly_rate") else None,
                }
                for job in jobs
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
