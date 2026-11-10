import os
import sqlite3

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

print("BASE_DIR =", BASE_DIR)

DB_PATH = os.path.join(
    BASE_DIR,
    "database",
    "tanay.db"
)

print("DB_PATH =", DB_PATH)

try:

    conn = sqlite3.connect(DB_PATH)

    print("\nDatabase Connected Successfully!")

    conn.close()

except Exception as e:

    print("\nDatabase Error:")
    print(e)