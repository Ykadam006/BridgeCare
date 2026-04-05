#!/usr/bin/env python3
"""
Seed providers from supabase/seeds/seed_providers.sql.
Usage: python scripts/seed_providers.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path(__file__).parent.parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env")
    sys.exit(1)

sql_path = Path(__file__).parent.parent / "supabase" / "seeds" / "seed_providers.sql"
sql = sql_path.read_text()

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    supabase.rpc("exec_sql", {"sql": sql}).execute()
    print("✓ Providers seeded")
except Exception as e:
    print(f"Note: rpc exec_sql not available. Run the SQL directly in Supabase dashboard.")
    print(f"File: {sql_path}")
