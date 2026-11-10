import sqlite3
import os

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
CREATE TABLE IF NOT EXISTS relationship(
    id INTEGER PRIMARY KEY,
    conversation_count INTEGER,
    trust_score INTEGER
)
""")

conn.commit()


def initialize_relationship():

    cursor.execute(
        "SELECT * FROM relationship"
    )

    row = cursor.fetchone()

    if row is None:

        cursor.execute("""
        INSERT INTO relationship
        VALUES (1, 0, 0)
        """)

        conn.commit()


initialize_relationship()


def update_relationship():

    cursor.execute("""
    UPDATE relationship
    SET
        conversation_count = conversation_count + 1,
        trust_score = trust_score + 1
    WHERE id = 1
    """)

    conn.commit()


def get_relationship():

    cursor.execute("""
    SELECT
        conversation_count,
        trust_score
    FROM relationship
    WHERE id = 1
    """)

    return cursor.fetchone()


def get_relationship_level():

    relationship = get_relationship()

    if relationship is None:
        return "New Friend"

    conversation_count, trust_score = relationship

    if conversation_count < 5:
        return "New Friend"

    elif conversation_count < 20:
        return "Friend"

    elif conversation_count < 50:
        return "Close Friend"

    else:
        return "Trusted Companion"


def get_relationship_label(count):

    if count < 5:
        return "New Friend"

    elif count < 15:
        return "Friend"

    elif count < 30:
        return "Close Friend"

    else:
        return "Best Friend"