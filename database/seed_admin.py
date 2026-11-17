"""
Seed Admin User with Secure Bcrypt Hashing.
Usage: python database/seed_admin.py [username] [password]
"""

import sys
import os
import bcrypt
from db import execute_statement, get_db_connection


def hash_password(plain_password: str) -> str:
    """Hash password using bcrypt with standard salt rounds."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def seed_admin(username="admin", password="admin123"):
    print(f"[*] Hashing password for user '{username}' using bcrypt...")
    hashed = hash_password(password)
    print(f"[*] Generated Hash: {hashed}")

    conn = get_db_connection()
    if conn is None:
        print("[!] MySQL database not connected. Demo hash ready for deployment.")
        return

    query = """
    INSERT INTO users (username, password_hash, role, status)
    VALUES (%s, %s, 'Admin', 'Active')
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), status = 'Active';
    """
    success = execute_statement(query, (username, hashed))
    if success:
        print(f"[✓] Admin user '{username}' seeded successfully in database.")
    else:
        print("[✗] Failed to seed user into MySQL.")


if __name__ == "__main__":
    u = sys.argv[1] if len(sys.argv) > 1 else "admin"
    p = sys.argv[2] if len(sys.argv) > 2 else "admin123"
    seed_admin(u, p)
