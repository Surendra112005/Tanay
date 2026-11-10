import sqlite3
import os
from datetime import datetime

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DATABASE_DIR = os.path.join(
    BASE_DIR,
    "database"
)

os.makedirs(
    DATABASE_DIR,
    exist_ok=True
)

DB_PATH = os.path.join(
    DATABASE_DIR,
    "tanay.db"
)

conn = sqlite3.connect(DB_PATH)

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS chat_history(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_message TEXT,
    emotion TEXT,
    ai_reply TEXT,
    timestamp TEXT
)
""")

conn.commit()


def save_memory(
    user_message,
    emotion,
    ai_reply
):

    cursor.execute("""
    INSERT INTO chat_history
    (
        user_message,
        emotion,
        ai_reply,
        timestamp
    )
    VALUES (?, ?, ?, ?)
    """,
    (
        user_message,
        emotion,
        ai_reply,
        datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    ))

    conn.commit()


def get_recent_memories(limit=5):

    cursor.execute("""
    SELECT
        user_message,
        emotion,
        ai_reply
    FROM chat_history
    ORDER BY id DESC
    LIMIT ?
    """, (limit,))

    return cursor.fetchall()


def search_memories(keyword):

    cursor.execute("""
    SELECT
        user_message,
        emotion,
        ai_reply
    FROM chat_history
    WHERE user_message LIKE ?
    ORDER BY id DESC
    LIMIT 5
    """,
    (
        f"%{keyword}%",
    ))

    return cursor.fetchall()


def show_memories():

    cursor.execute("""
    SELECT *
    FROM chat_history
    ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    for row in rows:
        print(row)


if __name__ == "__main__":
    show_memories()