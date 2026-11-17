"""
Database Connector & Helper Utilities for Credit Card Fraud & Network Anomaly Detection System.
Provides connection pooling, parameterized queries, and graceful fallback when offline.
"""

import os
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "credit_fraud_db")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")


def get_db_connection():
    """
    Establish a connection to the MySQL database.
    Returns connection object or None if connection fails.
    """
    try:
        import mysql.connector
        connection = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            autocommit=True,
            connect_timeout=3
        )
        return connection
    except Exception as e:
        # Graceful fallback for local development/demonstration without live MySQL instance
        print(f"[DB Warning] Could not connect to MySQL ({e}). Operating in memory/fallback mode.")
        return None


def execute_query(query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
    """
    Executes a SELECT query using parameterized arguments to prevent SQL injection.
    """
    conn = get_db_connection()
    if conn is None:
        return []

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"[DB Error] Query execution failed: {e}")
        if conn:
            conn.close()
        return []


def execute_statement(statement: str, params: Optional[tuple] = None) -> bool:
    """
    Executes an INSERT, UPDATE, or DELETE statement securely.
    """
    conn = get_db_connection()
    if conn is None:
        return False

    try:
        cursor = conn.cursor()
        cursor.execute(statement, params or ())
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"[DB Error] Statement execution failed: {e}")
        if conn:
            conn.close()
        return False


def test_connection() -> Dict[str, Any]:
    """Tests the MySQL connection and returns diagnostics."""
    conn = get_db_connection()
    if conn and conn.is_connected():
        server_info = conn.get_server_info()
        conn.close()
        return {"status": "connected", "server": server_info, "database": DB_NAME}
    return {"status": "disconnected", "database": DB_NAME, "message": "MySQL server unreachable"}


if __name__ == "__main__":
    print("Testing MySQL Connection...")
    res = test_connection()
    print(f"Connection Result: {res}")
