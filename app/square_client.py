"""
Square API Client for Little Red Coffee Dashboard

Handles:
- Labor API (timecards, team members, jobs)
- Orders API (transactions, line items)
- Catalog API (menu items, pricing)
"""

from datetime import datetime, timedelta
from typing import Optional
from square.client import Client
from app.config import settings, is_square_configured


class SquareAPI:
    def __init__(self):
        if not is_square_configured():
            raise ValueError("Square API not configured. Set SQUARE_ACCESS_TOKEN in .env")

        self.client = Client(
            access_token=settings.square_access_token,
            environment=settings.square_environment,
        )
        self._location_id = settings.square_location_id
        self._locations_cache = None

    # =========================================================================
    # LOCATIONS
    # =========================================================================

    def get_locations(self) -> list[dict]:
        """Get all business locations"""
        if self._locations_cache:
            return self._locations_cache

        result = self.client.locations.list_locations()
        if result.is_success():
            self._locations_cache = [loc.to_dict() for loc in result.body.get("locations", [])]
            return self._locations_cache
        else:
            raise Exception(f"Failed to get locations: {result.errors}")

    def get_location_id(self) -> str:
        """Get the configured location ID or the first available"""
        if self._location_id:
            return self._location_id

        locations = self.get_locations()
        if locations:
            self._location_id = locations[0]["id"]
            return self._location_id

        raise Exception("No locations found for this Square account")

    # =========================================================================
    # LABOR API - Staffing Analysis
    # =========================================================================

    def get_team_members(self) -> list[dict]:
        """Get all team members"""
        result = self.client.team.search_team_members(
            body={"query": {"filter": {"status": "ACTIVE"}}}
        )
        if result.is_success():
            return [tm.to_dict() for tm in result.body.get("team_members", [])]
        else:
            raise Exception(f"Failed to get team members: {result.errors}")

    def get_jobs(self) -> list[dict]:
        """Get all job definitions (roles/positions)"""
        result = self.client.labor.list_jobs()
        if result.is_success():
            return [job.to_dict() for job in result.body.get("jobs", [])]
        else:
            raise Exception(f"Failed to get jobs: {result.errors}")

    def get_timecards(
        self,
        start_date: datetime,
        end_date: datetime,
        team_member_id: Optional[str] = None,
    ) -> list[dict]:
        """
        Get timecards (clock in/out records) for a date range
        """
        location_id = self.get_location_id()

        query = {
            "filter": {
                "location_ids": [location_id],
                "start": {"start_at": start_date.isoformat() + "Z"},
                "end": {"end_at": end_date.isoformat() + "Z"},
            }
        }

        if team_member_id:
            query["filter"]["team_member_ids"] = [team_member_id]

        all_timecards = []
        cursor = None

        while True:
            body = {"query": query}
            if cursor:
                body["cursor"] = cursor

            result = self.client.labor.search_timecards(body=body)

            if result.is_success():
                timecards = result.body.get("timecards", [])
                all_timecards.extend([tc.to_dict() for tc in timecards])

                cursor = result.body.get("cursor")
                if not cursor:
                    break
            else:
                raise Exception(f"Failed to get timecards: {result.errors}")

        return all_timecards

    def get_labor_summary(
        self, start_date: datetime, end_date: datetime
    ) -> dict:
        """
        Get labor summary for staffing analysis
        """
        timecards = self.get_timecards(start_date, end_date)
        team_members = {tm["id"]: tm for tm in self.get_team_members()}
        jobs = {job["id"]: job for job in self.get_jobs()}

        total_hours = 0
        total_labor_cost = 0
        hours_by_employee = {}
        hours_by_job = {}

        for tc in timecards:
            # Calculate hours worked
            if tc.get("clock_in_at") and tc.get("clock_out_at"):
                clock_in = datetime.fromisoformat(tc["clock_in_at"].replace("Z", "+00:00"))
                clock_out = datetime.fromisoformat(tc["clock_out_at"].replace("Z", "+00:00"))
                hours = (clock_out - clock_in).total_seconds() / 3600

                # Subtract break time
                for brk in tc.get("breaks", []):
                    if brk.get("start_at") and brk.get("end_at"):
                        brk_start = datetime.fromisoformat(brk["start_at"].replace("Z", "+00:00"))
                        brk_end = datetime.fromisoformat(brk["end_at"].replace("Z", "+00:00"))
                        hours -= (brk_end - brk_start).total_seconds() / 3600

                total_hours += hours

                # Track by employee
                emp_id = tc.get("team_member_id", "unknown")
                emp_name = team_members.get(emp_id, {}).get("given_name", "Unknown")
                if emp_name not in hours_by_employee:
                    hours_by_employee[emp_name] = {"hours": 0, "cost": 0}
                hours_by_employee[emp_name]["hours"] += hours

                # Track by job/role
                job_id = tc.get("job_id")
                job_title = jobs.get(job_id, {}).get("title", "Unknown") if job_id else "Unknown"
                if job_title not in hours_by_job:
                    hours_by_job[job_title] = {"hours": 0, "cost": 0}
                hours_by_job[job_title]["hours"] += hours

                # Calculate labor cost if wage info available
                wage = tc.get("hourly_rate")
                if wage:
                    hourly_rate = wage.get("amount", 0) / 100  # Convert cents to dollars
                    cost = hours * hourly_rate
                    total_labor_cost += cost
                    hours_by_employee[emp_name]["cost"] += cost
                    hours_by_job[job_title]["cost"] += cost

        return {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
            },
            "totals": {
                "hours": round(total_hours, 2),
                "labor_cost": round(total_labor_cost, 2),
                "timecard_count": len(timecards),
            },
            "by_employee": {
                name: {
                    "hours": round(data["hours"], 2),
                    "cost": round(data["cost"], 2),
                }
                for name, data in sorted(
                    hours_by_employee.items(), key=lambda x: x[1]["hours"], reverse=True
                )
            },
            "by_job": {
                title: {
                    "hours": round(data["hours"], 2),
                    "cost": round(data["cost"], 2),
                }
                for title, data in sorted(
                    hours_by_job.items(), key=lambda x: x[1]["hours"], reverse=True
                )
            },
        }

    # =========================================================================
    # ORDERS API - Sales & Product Mix
    # =========================================================================

    def get_orders(
        self,
        start_date: datetime,
        end_date: datetime,
        limit: int = 500,
    ) -> list[dict]:
        """
        Get orders for a date range
        """
        location_id = self.get_location_id()

        all_orders = []
        cursor = None

        while True:
            body = {
                "location_ids": [location_id],
                "query": {
                    "filter": {
                        "date_time_filter": {
                            "created_at": {
                                "start_at": start_date.isoformat() + "Z",
                                "end_at": end_date.isoformat() + "Z",
                            }
                        },
                        "state_filter": {"states": ["COMPLETED"]},
                    },
                    "sort": {"sort_field": "CREATED_AT", "sort_order": "DESC"},
                },
                "limit": min(limit, 500),
            }

            if cursor:
                body["cursor"] = cursor

            result = self.client.orders.search_orders(body=body)

            if result.is_success():
                orders = result.body.get("orders", [])
                all_orders.extend([order.to_dict() for order in orders])

                cursor = result.body.get("cursor")
                if not cursor or len(all_orders) >= limit:
                    break
            else:
                raise Exception(f"Failed to get orders: {result.errors}")

        return all_orders[:limit]

    def get_catalog_items(self) -> dict[str, dict]:
        """
        Get all catalog items (menu items) as a lookup dict
        """
        all_items = {}
        cursor = None

        while True:
            body = {"types": ["ITEM", "ITEM_VARIATION", "CATEGORY"]}
            if cursor:
                body["cursor"] = cursor

            result = self.client.catalog.list_catalog(**body)

            if result.is_success():
                objects = result.body.get("objects", [])
                for obj in objects:
                    obj_dict = obj.to_dict()
                    all_items[obj_dict["id"]] = obj_dict

                cursor = result.body.get("cursor")
                if not cursor:
                    break
            else:
                raise Exception(f"Failed to get catalog: {result.errors}")

        return all_items

    def get_product_mix(
        self, start_date: datetime, end_date: datetime
    ) -> dict:
        """
        Analyze product mix from orders
        """
        orders = self.get_orders(start_date, end_date, limit=10000)
        catalog = self.get_catalog_items()

        item_sales = {}
        category_sales = {}
        total_revenue = 0
        total_items_sold = 0

        for order in orders:
            for line_item in order.get("line_items", []):
                item_name = line_item.get("name", "Unknown Item")
                quantity = int(line_item.get("quantity", "1"))

                # Get total money for this line item
                total_money = line_item.get("total_money", {})
                amount = total_money.get("amount", 0) / 100  # cents to dollars

                total_revenue += amount
                total_items_sold += quantity

                # Track by item
                if item_name not in item_sales:
                    item_sales[item_name] = {
                        "quantity": 0,
                        "revenue": 0,
                        "catalog_object_id": line_item.get("catalog_object_id"),
                    }
                item_sales[item_name]["quantity"] += quantity
                item_sales[item_name]["revenue"] += amount

                # Try to get category from catalog
                catalog_id = line_item.get("catalog_object_id")
                if catalog_id and catalog_id in catalog:
                    cat_obj = catalog[catalog_id]
                    # Get parent item to find category
                    if cat_obj.get("type") == "ITEM_VARIATION":
                        item_data = cat_obj.get("item_variation_data", {})
                        item_id = item_data.get("item_id")
                        if item_id and item_id in catalog:
                            parent_item = catalog[item_id]
                            item_data = parent_item.get("item_data", {})
                            cat_id = item_data.get("category_id")
                            if cat_id and cat_id in catalog:
                                cat_name = catalog[cat_id].get("category_data", {}).get("name", "Uncategorized")
                            else:
                                cat_name = "Uncategorized"
                        else:
                            cat_name = "Uncategorized"
                    else:
                        cat_name = "Uncategorized"
                else:
                    cat_name = "Uncategorized"

                if cat_name not in category_sales:
                    category_sales[cat_name] = {"quantity": 0, "revenue": 0}
                category_sales[cat_name]["quantity"] += quantity
                category_sales[cat_name]["revenue"] += amount

        # Sort by revenue
        sorted_items = sorted(
            item_sales.items(), key=lambda x: x[1]["revenue"], reverse=True
        )

        # Calculate percentages and format
        items_with_pct = []
        for name, data in sorted_items[:50]:  # Top 50 items
            items_with_pct.append({
                "name": name,
                "quantity": data["quantity"],
                "revenue": round(data["revenue"], 2),
                "pct_of_revenue": round(data["revenue"] / total_revenue * 100, 1) if total_revenue else 0,
                "avg_price": round(data["revenue"] / data["quantity"], 2) if data["quantity"] else 0,
            })

        categories_with_pct = []
        for name, data in sorted(category_sales.items(), key=lambda x: x[1]["revenue"], reverse=True):
            categories_with_pct.append({
                "name": name,
                "quantity": data["quantity"],
                "revenue": round(data["revenue"], 2),
                "pct_of_revenue": round(data["revenue"] / total_revenue * 100, 1) if total_revenue else 0,
            })

        return {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
            },
            "totals": {
                "revenue": round(total_revenue, 2),
                "items_sold": total_items_sold,
                "order_count": len(orders),
                "avg_ticket": round(total_revenue / len(orders), 2) if orders else 0,
            },
            "top_items": items_with_pct,
            "by_category": categories_with_pct,
        }

    def get_sales_by_period(
        self, start_date: datetime, end_date: datetime, group_by: str = "day"
    ) -> list[dict]:
        """
        Get sales aggregated by day, week, or month
        """
        orders = self.get_orders(start_date, end_date, limit=10000)

        sales_by_period = {}

        for order in orders:
            created_at = order.get("created_at", "")
            if not created_at:
                continue

            order_date = datetime.fromisoformat(created_at.replace("Z", "+00:00"))

            if group_by == "day":
                period_key = order_date.strftime("%Y-%m-%d")
            elif group_by == "week":
                period_key = order_date.strftime("%Y-W%W")
            elif group_by == "month":
                period_key = order_date.strftime("%Y-%m")
            else:
                period_key = order_date.strftime("%Y-%m-%d")

            if period_key not in sales_by_period:
                sales_by_period[period_key] = {
                    "revenue": 0,
                    "order_count": 0,
                    "items_sold": 0,
                }

            total_money = order.get("total_money", {})
            sales_by_period[period_key]["revenue"] += total_money.get("amount", 0) / 100
            sales_by_period[period_key]["order_count"] += 1

            for line_item in order.get("line_items", []):
                sales_by_period[period_key]["items_sold"] += int(line_item.get("quantity", "1"))

        # Sort and format
        result = []
        for period, data in sorted(sales_by_period.items()):
            result.append({
                "period": period,
                "revenue": round(data["revenue"], 2),
                "order_count": data["order_count"],
                "items_sold": data["items_sold"],
                "avg_ticket": round(data["revenue"] / data["order_count"], 2) if data["order_count"] else 0,
            })

        return result


# Singleton instance - created on first use
_square_api: Optional[SquareAPI] = None


def get_square_api() -> SquareAPI:
    """Get or create the Square API client"""
    global _square_api
    if _square_api is None:
        _square_api = SquareAPI()
    return _square_api
