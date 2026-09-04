"""
dashboard_db.py
--------------
Database module and seed data generator for VisionDesk AI Workplace Monitoring
& Safety Analytics Dashboard.
"""

import sqlite3
import random
from datetime import datetime, timedelta
import pandas as pd

from pathlib import Path

DB_PATH = Path(__file__).parent / "vision_desk_ai.db"

DEPARTMENTS = [
    "Assembly Line Alpha",
    "Warehouse Bay 3",
    "Chemical Storage",
    "Fabrication Plant",
    "Loading Dock North",
    "Robotics & Automation Lab"
]

VIOLATION_TYPES = [
    "NO-Hardhat",
    "NO-Safety-Vest",
    "NO-Gloves",
    "NO-Eye-Protection",
    "Unsafe Behavior",
    "Restricted Zone Access",
    "Equipment Obstruction"
]

SEVERITY_LEVELS = ["Low", "Medium", "High", "Critical"]
STATUSES = ["Open", "Investigating", "Resolved"]

SUPERVISOR_NOTES_TEMPLATES = [
    "Worker observed operating machinery without mandatory protective headgear.",
    "Uncontained chemical bucket left near high-foot-traffic passageway.",
    "Personnel crossed perimeter line into active automated robotic workspace.",
    "Safety vest missing during night-shift loading operation.",
    "Eye protection removed during welding prep phase; verbal warning issued.",
    "Emergency exit aisle obstructed by unpalletized cargo boxes.",
    "Forklift speed limit exceeded in designated pedestrian zone.",
    "Gloves absent while handling sharp sheet metal materials."
]

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_dashboard_db(force_reseed: bool = False):
    """Initializes tables and seeds historical workplace safety data if empty."""
    conn = get_connection()
    cursor = conn.cursor()

    # Create safety_violations table if not exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS safety_violations (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            date TEXT NOT NULL,
            hour INTEGER NOT NULL,
            department TEXT NOT NULL,
            location TEXT NOT NULL,
            violation_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            status TEXT NOT NULL,
            resolution_time_hrs REAL,
            repeat_offender INTEGER NOT NULL DEFAULT 0,
            notes TEXT
        )
    """)

    # Create total observations table for accurate compliance % calculation
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS safety_observations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            department TEXT NOT NULL,
            total_observations INTEGER NOT NULL,
            compliant_observations INTEGER NOT NULL
        )
    """)

    conn.commit()

    # Check count
    cursor.execute("SELECT COUNT(*) FROM safety_violations")
    count = cursor.fetchone()[0]

    if count < 100 or force_reseed:
        if force_reseed:
            cursor.execute("DELETE FROM safety_violations")
            cursor.execute("DELETE FROM safety_observations")
            conn.commit()

        _seed_realistic_data(conn)

    conn.close()

def _seed_realistic_data(conn):
    cursor = conn.cursor()
    random.seed(42)  # Consistent reproducible seed

    now = datetime.now()
    violations_data = []
    observations_data = []
    vio_seq = 10000

    # Generate 90 days of sample data
    for day_offset in range(90, -1, -1):
        curr_date = (now - timedelta(days=day_offset)).date()
        date_str = curr_date.isoformat()

        # Generate observations per department
        for dept in DEPARTMENTS:
            # Baseline observations: 50 - 120 per dept per day
            total_obs = random.randint(60, 140)
            
            # High risk depts have slightly more violations
            if dept in ["Chemical Storage", "Fabrication Plant"]:
                vio_count = random.randint(1, 6)
            elif dept == "Robotics & Automation Lab":
                vio_count = random.randint(0, 2)
            else:
                vio_count = random.randint(1, 4)

            compliant_obs = max(0, total_obs - vio_count)
            observations_data.append((date_str, dept, total_obs, compliant_obs))

            # Create detailed violation records
            for i in range(vio_count):
                vio_seq += 1
                vio_id = f"VIO-{vio_seq}"
                # Hour biased towards shift changes and mid-afternoon
                hour = random.choice([7, 8, 9, 10, 11, 13, 14, 15, 16, 19, 20])
                minute = random.randint(0, 59)
                timestamp = f"{date_str} {hour:02d}:{minute:02d}:00"

                v_type = random.choice(VIOLATION_TYPES)
                
                # Assign logical severity
                if v_type in ["Restricted Zone Access", "Unsafe Behavior"]:
                    severity = random.choice(["Medium", "High", "Critical"])
                elif v_type in ["NO-Hardhat", "NO-Eye-Protection"]:
                    severity = random.choice(["Medium", "High"])
                else:
                    severity = random.choice(["Low", "Medium"])

                # Status distribution
                if day_offset < 2:
                    status = random.choice(["Open", "Investigating", "Resolved"])
                elif day_offset < 7:
                    status = random.choice(["Investigating", "Resolved", "Resolved"])
                else:
                    status = "Resolved"

                if status == "Resolved":
                    resolution_hrs = round(random.uniform(0.5, 18.0), 1)
                elif status == "Investigating":
                    resolution_hrs = round(random.uniform(0.2, 5.0), 1)
                else:
                    resolution_hrs = None

                repeat = 1 if random.random() < 0.22 else 0
                notes = random.choice(SUPERVISOR_NOTES_TEMPLATES)
                location = f"Zone {random.randint(1, 5)} - Section {chr(65 + random.randint(0, 3))}"

                violations_data.append((
                    vio_id, timestamp, date_str, hour, dept, location,
                    v_type, severity, status, resolution_hrs, repeat, notes
                ))

    cursor.executemany("""
        INSERT OR REPLACE INTO safety_violations 
        (id, timestamp, date, hour, department, location, violation_type, severity, status, resolution_time_hrs, repeat_offender, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, violations_data)

    cursor.executemany("""
        INSERT INTO safety_observations (date, department, total_observations, compliant_observations)
        VALUES (?, ?, ?, ?)
    """, observations_data)

    conn.commit()

def load_data(start_date=None, end_date=None, departments=None, severities=None, statuses=None, violation_types=None):
    """Fetches filtered violation records as a Pandas DataFrame."""
    conn = get_connection()
    query = "SELECT * FROM safety_violations WHERE 1=1"
    params = []

    if start_date:
        query += " AND date >= ?"
        params.append(str(start_date))

    if end_date:
        query += " AND date <= ?"
        params.append(str(end_date))

    if departments:
        query += f" AND department IN ({','.join(['?']*len(departments))})"
        params.extend(departments)

    if severities:
        query += f" AND severity IN ({','.join(['?']*len(severities))})"
        params.extend(severities)

    if statuses:
        query += f" AND status IN ({','.join(['?']*len(statuses))})"
        params.extend(statuses)

    if violation_types:
        query += f" AND violation_type IN ({','.join(['?']*len(violation_types))})"
        params.extend(violation_types)

    query += " ORDER BY timestamp DESC"
    df = pd.read_sql_query(query, conn, params=params)
    conn.close()
    return df

def get_compliance_metrics(start_date=None, end_date=None, departments=None):
    """Calculates compliance % using observations table."""
    conn = get_connection()
    query = "SELECT SUM(total_observations) as total_obs, SUM(compliant_observations) as comp_obs FROM safety_observations WHERE 1=1"
    params = []

    if start_date:
        query += " AND date >= ?"
        params.append(str(start_date))
    if end_date:
        query += " AND date <= ?"
        params.append(str(end_date))
    if departments:
        query += f" AND department IN ({','.join(['?']*len(departments))})"
        params.extend(departments)

    cursor = conn.cursor()
    cursor.execute(query, params)
    row = cursor.fetchone()
    conn.close()

    total_obs = row[0] or 0
    comp_obs = row[1] or 0

    if total_obs == 0:
        return 100.0, 0, 0

    comp_pct = round((comp_obs / total_obs) * 100, 1)
    return comp_pct, total_obs, comp_obs

if __name__ == "__main__":
    init_dashboard_db(force_reseed=True)
    print("Dashboard database initialized successfully.")
