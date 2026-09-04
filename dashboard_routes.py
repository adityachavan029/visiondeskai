
"""
dashboard_routes.py
--------------------
FastAPI endpoints for Workplace Monitoring & Safety Analytics Dashboard.
"""

from typing import Optional, List
from fastapi import APIRouter, Query, Response
from dashboard_db import load_data, get_compliance_metrics, init_dashboard_db
import pandas as pd
import json

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Ensure DB is initialized on import
try:
    init_dashboard_db()
except Exception as e:
    print(f"Dashboard DB initialization note: {e}")

@router.get("/analytics")
async def get_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    departments: Optional[List[str]] = Query(None),
    severities: Optional[List[str]] = Query(None),
    statuses: Optional[List[str]] = Query(None),
    violation_types: Optional[List[str]] = Query(None),
):
    """
    Returns aggregated KPIs, breakdown charts, heatmap data, and full violation records.
    """
    init_dashboard_db()
    df = load_data(
        start_date=start_date,
        end_date=end_date,
        departments=departments,
        severities=severities,
        statuses=statuses,
        violation_types=violation_types,
    )

    comp_pct, total_obs, comp_obs = get_compliance_metrics(
        start_date=start_date,
        end_date=end_date,
        departments=departments,
    )

    # 1. KPIs
    total_violations = len(df)
    critical_count = len(df[df["severity"] == "Critical"]) if not df.empty else 0
    resolved_count = len(df[df["status"] == "Resolved"]) if not df.empty else 0
    open_count = len(df[df["status"] == "Open"]) if not df.empty else 0
    investigating_count = len(df[df["status"] == "Investigating"]) if not df.empty else 0

    resolution_rate = round((resolved_count / total_violations * 100), 1) if total_violations > 0 else 100.0
    
    avg_res_time = 0.0
    if not df.empty and "resolution_time_hrs" in df.columns:
        valid_times = df["resolution_time_hrs"].dropna()
        if not valid_times.empty:
            avg_res_time = round(float(valid_times.mean()), 1)

    repeat_count = int(df["repeat_offender"].sum()) if not df.empty and "repeat_offender" in df.columns else 0
    repeat_rate = round((repeat_count / total_violations * 100), 1) if total_violations > 0 else 0.0

    # High risk department calculation
    high_risk_dept = "N/A"
    if not df.empty:
        dept_counts = df["department"].value_counts()
        if not dept_counts.empty:
            high_risk_dept = str(dept_counts.index[0])

    # Peak hazard hour
    peak_hour_str = "N/A"
    if not df.empty and "hour" in df.columns:
        hour_counts = df["hour"].value_counts()
        if not hour_counts.empty:
            top_h = hour_counts.index[0]
            peak_hour_str = f"{top_h:02d}:00 - {top_h+1:02d}:00"

    # 2. Charts Data
    # Violations by Type
    type_counts = []
    if not df.empty:
        type_agg = df.groupby("violation_type").size().reset_index(name="count")
        type_counts = type_agg.to_dict(orient="records")

    # Severity distribution
    severity_counts = []
    if not df.empty:
        sev_agg = df.groupby("severity").size().reset_index(name="count")
        severity_counts = sev_agg.to_dict(orient="records")

    # Status distribution
    status_counts = []
    if not df.empty:
        stat_agg = df.groupby("status").size().reset_index(name="count")
        status_counts = stat_agg.to_dict(orient="records")

    # Trend over time (daily count)
    trend_data = []
    if not df.empty:
        df["date_only"] = df["date"]
        daily_agg = df.groupby("date_only").agg(
            violations=("id", "count"),
            critical=("severity", lambda s: (s == "Critical").sum()),
            resolved=("status", lambda st: (st == "Resolved").sum())
        ).reset_index()

        daily_agg = daily_agg.sort_values("date_only")
        # Calculate moving compliance score
        daily_agg["compliance"] = daily_agg["violations"].apply(lambda v: max(65.0, round(100.0 - (v * 2.5), 1)))
        trend_data = daily_agg.to_dict(orient="records")

    # Department Leaderboard / Scores
    dept_leaderboard = []
    if not df.empty:
        dept_group = df.groupby("department").agg(
            violations=("id", "count"),
            critical=("severity", lambda s: (s == "Critical").sum()),
            repeats=("repeat_offender", "sum")
        ).reset_index()

        for _, row in dept_group.iterrows():
            d_name = row["department"]
            v_cnt = int(row["violations"])
            c_cnt = int(row["critical"])
            r_cnt = int(row["repeats"])
            
            # Simple scoring metric
            score = max(50.0, round(98.0 - (v_cnt * 1.8) - (c_cnt * 3.5), 1))
            status_color = "green" if score >= 90 else ("amber" if score >= 78 else "red")
            
            dept_leaderboard.append({
                "department": d_name,
                "compliance_score": score,
                "violations": v_cnt,
                "critical": c_cnt,
                "repeats": r_cnt,
                "status_indicator": status_color
            })
        
        dept_leaderboard.sort(key=lambda x: x["compliance_score"], reverse=True)

    # Risk Heatmap (Hour of Day vs Department)
    heatmap_matrix = []
    if not df.empty:
        h_matrix = df.groupby(["department", "hour"]).size().unstack(fill_value=0)
        all_depts = df["department"].unique().tolist()
        hours = list(range(7, 21)) # Shift hours 7am - 8pm
        
        for dept in all_depts:
            row_data = {"department": dept}
            for h in hours:
                val = int(h_matrix.loc[dept, h]) if (dept in h_matrix.index and h in h_matrix.columns) else 0
                row_data[f"h_{h}"] = val
            heatmap_matrix.append(row_data)

    # Convert records for response
    records = df.to_dict(orient="records") if not df.empty else []

    return {
        "kpis": {
            "total_violations": total_violations,
            "critical_count": critical_count,
            "resolved_count": resolved_count,
            "open_count": open_count,
            "investigating_count": investigating_count,
            "compliance_percentage": comp_pct,
            "total_observations": total_obs,
            "compliant_observations": comp_obs,
            "resolution_rate": resolution_rate,
            "avg_resolution_time_hrs": avg_res_time,
            "repeat_count": repeat_count,
            "repeat_rate": repeat_rate,
            "high_risk_department": high_risk_dept,
            "peak_hazard_time": peak_hour_str
        },
        "charts": {
            "violation_types": type_counts,
            "severities": severity_counts,
            "statuses": status_counts,
            "trend": trend_data,
            "dept_leaderboard": dept_leaderboard,
            "heatmap": heatmap_matrix
        },
        "violations": records
    }

@router.get("/export")
async def export_report(format: str = "csv"):
    """Exports violation log as CSV."""
    df = load_data()
    if format == "csv":
        csv_data = df.to_csv(index=False)
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=safety_compliance_report.csv"}
        )
    return {"error": "Unsupported format"}
