"""
Little Red Coffee Ltd. - Financial Dashboard API
"""

from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pathlib import Path
from datetime import datetime, timedelta, date
from typing import Optional, Any
import sys
import time
import threading

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
from data.recipes import (
    get_ingredients,
    get_recipes,
    get_ingredient_by_id,
    get_recipe_by_id,
    reload_data as reload_recipe_data,
    ingredient_to_dict,
    recipe_to_dict,
    update_ingredient,
    add_ingredient,
    delete_ingredient,
    update_recipe,
    link_recipe_ingredient,
    get_unlinked_ingredients,
)


# =============================================================================
# PERSISTENT CACHE FOR SQUARE API DATA
# =============================================================================

import json

CACHE_DIR = Path(__file__).parent.parent / "data" / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


class PersistentCache:
    """In-memory cache with disk persistence for offline fallback"""

    def __init__(self, default_ttl: int = 300):  # 5 minutes default
        self._cache: dict[str, dict[str, Any]] = {}
        self._lock = threading.Lock()
        self.default_ttl = default_ttl

    def _get_cache_path(self, key: str) -> Path:
        """Get the file path for a cache key"""
        safe_key = key.replace("/", "_").replace("?", "_")
        return CACHE_DIR / f"{safe_key}.json"

    def get(self, key: str) -> tuple[Any, float | None]:
        """Get cached value and timestamp. Returns (None, None) if not cached or expired."""
        with self._lock:
            if key not in self._cache:
                return None, None

            entry = self._cache[key]
            if time.time() > entry["expires_at"]:
                del self._cache[key]
                return None, None

            return entry["data"], entry["cached_at"]

    def get_stale(self, key: str) -> tuple[Any, float | None]:
        """Get cached value even if expired (from memory or disk). For offline fallback."""
        with self._lock:
            # Check memory cache first (even if expired)
            if key in self._cache:
                entry = self._cache[key]
                return entry["data"], entry["cached_at"]

            # Try disk cache
            cache_path = self._get_cache_path(key)
            if cache_path.exists():
                try:
                    with open(cache_path, "r") as f:
                        entry = json.load(f)
                    return entry["data"], entry["cached_at"]
                except (json.JSONDecodeError, KeyError, IOError):
                    pass

            return None, None

    def set(self, key: str, data: Any, ttl: int | None = None) -> float:
        """Cache data with TTL. Also persists to disk for offline fallback."""
        ttl = ttl or self.default_ttl
        cached_at = time.time()
        entry = {
            "data": data,
            "cached_at": cached_at,
            "expires_at": cached_at + ttl,
        }

        with self._lock:
            self._cache[key] = entry

            # Persist to disk for offline fallback
            cache_path = self._get_cache_path(key)
            try:
                with open(cache_path, "w") as f:
                    json.dump(entry, f)
            except IOError:
                pass  # Disk write failure is non-fatal

        return cached_at

    def clear(self, key: str | None = None):
        """Clear specific key or all cache (memory only, keeps disk for fallback)"""
        with self._lock:
            if key:
                self._cache.pop(key, None)
            else:
                self._cache.clear()


# Global cache instance
square_cache = PersistentCache(default_ttl=300)  # 5 minute TTL


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


# =============================================================================
# SQUARE API ENDPOINTS
# =============================================================================


@app.get("/api/square/status")
async def get_square_status():
    """Check if Square API is configured and connected"""
    if not is_square_configured():
        return {"configured": False, "connected": False, "message": "Square API not configured. Add SQUARE_ACCESS_TOKEN to .env"}

    try:
        from app.square_client import get_square_api
        api = get_square_api()
        locations = api.get_locations()
        result = {
            "configured": True,
            "connected": True,
            "locations": [{"id": loc["id"], "name": loc.get("name", "Unknown")} for loc in locations],
        }
        # Cache the status for offline detection
        square_cache.set("status", result)
        return result
    except Exception as e:
        # Check if we have cached data to indicate offline mode
        cached_data, cached_at = square_cache.get_stale("product_mix_30")
        has_cached_data = cached_data is not None
        return {
            "configured": True,
            "connected": False,
            "offline": True,
            "has_cached_data": has_cached_data,
            "error": str(e),
        }


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
    refresh: bool = Query(default=False, description="Force refresh from Square API"),
):
    """Get product mix analysis from Square orders"""
    if not is_square_configured():
        raise HTTPException(status_code=400, detail="Square API not configured")

    cache_key = f"product_mix_{days}"

    # Check cache first (unless refresh requested)
    if not refresh:
        cached_data, cached_at = square_cache.get(cache_key)
        if cached_data is not None:
            return {
                **cached_data,
                "_cache": {
                    "cached": True,
                    "stale": False,
                    "cached_at": datetime.fromtimestamp(cached_at).isoformat(),
                    "age_seconds": int(time.time() - cached_at),
                }
            }

    try:
        from app.square_client import get_square_api
        api = get_square_api()

        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        data = api.get_product_mix(start_date, end_date)
        cached_at = square_cache.set(cache_key, data)

        return {
            **data,
            "_cache": {
                "cached": False,
                "stale": False,
                "cached_at": datetime.fromtimestamp(cached_at).isoformat(),
                "age_seconds": 0,
            }
        }
    except Exception as e:
        # Try to return stale cached data instead of failing
        stale_data, stale_at = square_cache.get_stale(cache_key)
        if stale_data is not None:
            age_seconds = int(time.time() - stale_at)
            return {
                **stale_data,
                "_cache": {
                    "cached": True,
                    "stale": True,
                    "cached_at": datetime.fromtimestamp(stale_at).isoformat(),
                    "age_seconds": age_seconds,
                    "offline_reason": str(e),
                }
            }
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/square/sales")
async def get_sales_data(
    days: int = Query(default=30, ge=1, le=365, description="Number of days to look back"),
    group_by: str = Query(default="day", regex="^(day|week|month)$"),
):
    """Get sales data grouped by period"""
    if not is_square_configured():
        raise HTTPException(status_code=400, detail="Square API not configured")

    cache_key = f"sales_{days}_{group_by}"

    # Check cache first
    cached_data, cached_at = square_cache.get(cache_key)
    if cached_data is not None:
        return {
            **cached_data,
            "_cache": {
                "cached": True,
                "stale": False,
                "cached_at": datetime.fromtimestamp(cached_at).isoformat(),
                "age_seconds": int(time.time() - cached_at),
            }
        }

    try:
        from app.square_client import get_square_api
        api = get_square_api()

        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        data = {"sales": api.get_sales_by_period(start_date, end_date, group_by)}
        cached_at = square_cache.set(cache_key, data)

        return {
            **data,
            "_cache": {
                "cached": False,
                "stale": False,
                "cached_at": datetime.fromtimestamp(cached_at).isoformat(),
                "age_seconds": 0,
            }
        }
    except Exception as e:
        # Try to return stale cached data
        stale_data, stale_at = square_cache.get_stale(cache_key)
        if stale_data is not None:
            age_seconds = int(time.time() - stale_at)
            return {
                **stale_data,
                "_cache": {
                    "cached": True,
                    "stale": True,
                    "cached_at": datetime.fromtimestamp(stale_at).isoformat(),
                    "age_seconds": age_seconds,
                    "offline_reason": str(e),
                }
            }
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/square/team")
async def get_team_data(
    refresh: bool = Query(default=False, description="Force refresh from Square API"),
):
    """Get team member data from Square"""
    if not is_square_configured():
        raise HTTPException(status_code=400, detail="Square API not configured")

    cache_key = "team_data"

    # Check cache first (unless refresh requested)
    if not refresh:
        cached_data, cached_at = square_cache.get(cache_key)
        if cached_data is not None:
            return {
                **cached_data,
                "_cache": {
                    "cached": True,
                    "stale": False,
                    "cached_at": datetime.fromtimestamp(cached_at).isoformat(),
                    "age_seconds": int(time.time() - cached_at),
                }
            }

    try:
        from app.square_client import get_square_api
        api = get_square_api()

        team_members = api.get_team_members()
        jobs = api.get_jobs()

        data = {
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

        cached_at = square_cache.set(cache_key, data)

        return {
            **data,
            "_cache": {
                "cached": False,
                "stale": False,
                "cached_at": datetime.fromtimestamp(cached_at).isoformat(),
                "age_seconds": 0,
            }
        }
    except Exception as e:
        # Try to return stale cached data
        stale_data, stale_at = square_cache.get_stale(cache_key)
        if stale_data is not None:
            age_seconds = int(time.time() - stale_at)
            return {
                **stale_data,
                "_cache": {
                    "cached": True,
                    "stale": True,
                    "cached_at": datetime.fromtimestamp(stale_at).isoformat(),
                    "age_seconds": age_seconds,
                    "offline_reason": str(e),
                }
            }
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/square/refresh")
async def refresh_square_cache():
    """Clear Square API cache to force fresh data on next request"""
    square_cache.clear()
    return {"status": "ok", "message": "Cache cleared"}


# =============================================================================
# RECIPE COSTING API ENDPOINTS
# =============================================================================


@app.get("/api/recipes")
async def list_recipes(
    sort_by: str = Query(default="name", regex="^(name|cost|profit|margin)$"),
):
    """Get all recipes with costing data"""
    recipes = get_recipes()

    # Convert to dicts
    recipe_dicts = [recipe_to_dict(r) for r in recipes]

    # Helper to calculate batch profit correctly:
    # batch_revenue = price_per_portion × portions
    # batch_profit = batch_revenue - batch_cost
    def calc_batch_profit(r):
        price = r["proposed_sale_price"]
        cost = r["cost_per_recipe"]
        portions = r["portions"] or 1
        if price and cost:
            return (price * portions) - cost
        return None

    def calc_batch_margin(r):
        price = r["proposed_sale_price"]
        cost = r["cost_per_recipe"]
        portions = r["portions"] or 1
        if price and cost:
            batch_revenue = price * portions
            batch_profit = batch_revenue - cost
            return batch_profit / batch_revenue
        return 0

    # Sort by requested field
    if sort_by == "name":
        recipe_dicts.sort(key=lambda r: r["name"].lower())
    elif sort_by == "cost":
        recipe_dicts.sort(key=lambda r: r["cost_per_recipe"] or 0, reverse=True)
    elif sort_by == "profit":
        recipe_dicts.sort(key=lambda r: calc_batch_profit(r) or 0, reverse=True)
    elif sort_by == "margin":
        recipe_dicts.sort(key=calc_batch_margin, reverse=True)

    # Calculate summary stats using correct batch profit
    total_recipes = len(recipe_dicts)
    recipes_with_data = [r for r in recipe_dicts if r["proposed_sale_price"] and r["cost_per_recipe"]]
    profitable = [r for r in recipes_with_data if (calc_batch_profit(r) or 0) > 0]
    unprofitable = [r for r in recipes_with_data if (calc_batch_profit(r) or 0) <= 0]

    return {
        "recipes": recipe_dicts,
        "summary": {
            "total_recipes": total_recipes,
            "profitable_count": len(profitable),
            "unprofitable_count": len(unprofitable),
            "avg_cost": round(
                sum(r["cost_per_recipe"] or 0 for r in recipe_dicts) / total_recipes, 2
            ) if total_recipes else 0,
            "avg_profit": round(
                sum(calc_batch_profit(r) or 0 for r in recipes_with_data) / len(recipes_with_data), 2
            ) if recipes_with_data else 0,
        },
    }


@app.get("/api/recipes/unlinked")
async def get_unlinked_recipe_ingredients():
    """Get all recipe ingredients that need manual linking to master ingredients"""
    unlinked = get_unlinked_ingredients()
    return {
        "unlinked": unlinked,
        "count": len(unlinked),
    }


@app.get("/api/recipes/{recipe_name}")
async def get_recipe(recipe_name: str):
    """Get a specific recipe by name"""
    recipes = get_recipes()

    # Find by exact match first, then case-insensitive
    for recipe in recipes:
        if recipe.name == recipe_name:
            return recipe_to_dict(recipe)

    for recipe in recipes:
        if recipe.name.lower() == recipe_name.lower():
            return recipe_to_dict(recipe)

    raise HTTPException(status_code=404, detail=f"Recipe '{recipe_name}' not found")


@app.put("/api/recipes/{recipe_id}")
async def update_single_recipe(recipe_id: str, request: Request):
    """Update a recipe's editable fields (portions, price, prep time, etc.)"""
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    result = update_recipe(recipe_id, body)
    if not result:
        raise HTTPException(status_code=404, detail="Recipe not found")

    return {"status": "ok", "recipe": result}


@app.get("/api/ingredients")
async def list_ingredients(
    category: Optional[str] = Query(default=None, description="Filter by category"),
):
    """Get all master ingredients from the costing sheet"""
    ingredients = get_ingredients()

    # Filter by category if specified
    if category:
        ingredients = [i for i in ingredients if i.category.lower() == category.lower()]

    # Group by category
    by_category: dict[str, list] = {}
    for ing in ingredients:
        cat = ing.category
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(ingredient_to_dict(ing))

    return {
        "ingredients": [ingredient_to_dict(i) for i in ingredients],
        "by_category": by_category,
        "categories": list(by_category.keys()),
        "total_count": len(ingredients),
    }


@app.get("/api/ingredients/categories")
async def get_ingredient_categories():
    """Get list of ingredient categories"""
    ingredients = get_ingredients()
    categories = {}
    for ing in ingredients:
        if ing.category not in categories:
            categories[ing.category] = 0
        categories[ing.category] += 1

    return {
        "categories": [
            {"name": name, "count": count}
            for name, count in sorted(categories.items())
        ]
    }


@app.post("/api/recipes/reload")
async def reload_recipes():
    """Reload recipes from JSON files"""
    ing_count, recipe_count = reload_recipe_data()
    return {
        "status": "ok",
        "ingredients_loaded": ing_count,
        "recipes_loaded": recipe_count,
    }


@app.post("/api/recipes/{recipe_id}/link-ingredient")
async def link_ingredient_to_recipe(recipe_id: str, request: Request):
    """
    Link a recipe ingredient to a master ingredient.
    This enables auto-updating of costs when the master ingredient price changes.

    Body: {
        "ingredient_index": 0,  // Index of the ingredient in the recipe's ingredient list
        "master_ingredient_id": "abc123..."  // ID of the master ingredient to link to
    }
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    ingredient_index = body.get("ingredient_index")
    master_ingredient_id = body.get("master_ingredient_id")

    if ingredient_index is None:
        raise HTTPException(status_code=400, detail="ingredient_index is required")
    if not master_ingredient_id:
        raise HTTPException(status_code=400, detail="master_ingredient_id is required")

    result = link_recipe_ingredient(recipe_id, ingredient_index, master_ingredient_id)
    if not result:
        raise HTTPException(status_code=404, detail="Recipe or ingredient not found")

    return {"status": "ok", "recipe": result}


# =============================================================================
# INGREDIENT CRUD ENDPOINTS
# =============================================================================


@app.get("/api/ingredients/{ingredient_id}")
async def get_single_ingredient(ingredient_id: str):
    """Get a single ingredient by ID"""
    ing = get_ingredient_by_id(ingredient_id)
    if not ing:
        raise HTTPException(status_code=404, detail=f"Ingredient not found")
    return ingredient_to_dict(ing)


@app.put("/api/ingredients/{ingredient_id}")
async def update_single_ingredient(ingredient_id: str, request: Request):
    """Update an ingredient's fields"""
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    result = update_ingredient(ingredient_id, body)
    if not result:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    return {"status": "ok", "ingredient": result}


@app.post("/api/ingredients")
async def create_ingredient(request: Request):
    """Create a new ingredient"""
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    if not body.get("name"):
        raise HTTPException(status_code=400, detail="Name is required")

    result = add_ingredient(body)
    return {"status": "ok", "ingredient": result}


@app.delete("/api/ingredients/{ingredient_id}")
async def remove_ingredient(ingredient_id: str):
    """Delete an ingredient"""
    success = delete_ingredient(ingredient_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return {"status": "ok", "deleted": ingredient_id}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
