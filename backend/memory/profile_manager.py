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

conn = sqlite3.connect(
    DB_PATH,
    check_same_thread=False
)

cursor = conn.cursor()


# ----------------------------------------------------
# USER PROFILE TABLE
# ----------------------------------------------------

cursor.execute("""
CREATE TABLE IF NOT EXISTS user_profile(
    id INTEGER PRIMARY KEY,
    first_seen TEXT,
    last_seen TEXT,
    conversation_count INTEGER
)
""")


# ----------------------------------------------------
# DYNAMIC PROFILE MEMORY
# ----------------------------------------------------

cursor.execute("""
CREATE TABLE IF NOT EXISTS profile_data(
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT
)
""")

conn.commit()


# ----------------------------------------------------
# USER PROFILE
# ----------------------------------------------------

def update_user_profile():

    cursor.execute(
        "SELECT * FROM user_profile WHERE id = 1"
    )

    profile = cursor.fetchone()

    now = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    if profile is None:

        cursor.execute("""
        INSERT INTO user_profile
        VALUES (?, ?, ?, ?)
        """,
        (
            1,
            now,
            now,
            1
        ))

    else:

        cursor.execute("""
        UPDATE user_profile
        SET
            last_seen=?,
            conversation_count=conversation_count+1
        WHERE id=1
        """,
        (
            now,
        ))

    conn.commit()


def get_user_profile():

    cursor.execute("""
    SELECT
        first_seen,
        last_seen,
        conversation_count
    FROM user_profile
    WHERE id=1
    """)

    return cursor.fetchone()


# ----------------------------------------------------
# SAVE ANY PROFILE INFORMATION
# ----------------------------------------------------

def save_profile(key, value):

    key = key.lower().strip()

    value = value.strip()

    cursor.execute("""
    INSERT INTO profile_data
    (
        key,
        value,
        updated_at
    )
    VALUES (?, ?, ?)

    ON CONFLICT(key)

    DO UPDATE SET

        value=excluded.value,

        updated_at=excluded.updated_at
    """,
    (
        key,
        value,
        datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    ))

    conn.commit()


# ----------------------------------------------------
# GET VALUE
# ----------------------------------------------------

def get_profile_value(key):

    cursor.execute("""
    SELECT value
    FROM profile_data
    WHERE key=?
    """,
    (
        key.lower(),
    ))

    row = cursor.fetchone()

    if row:
        return row[0]

    return None


# ----------------------------------------------------
# GET ALL
# ----------------------------------------------------

def get_profile():

    cursor.execute("""
    SELECT
        key,
        value
    FROM profile_data
    """)

    return dict(
        cursor.fetchall()
    )


# ----------------------------------------------------
# PROFILE TO TEXT
# ----------------------------------------------------

def profile_to_text():

    profile = get_profile()

    if not profile:

        return "No profile information."

    text = ""

    for key, value in profile.items():

        text += f"{key}: {value}\n"

    return text


# ----------------------------------------------------
# DAYS KNOWN
# ----------------------------------------------------

def get_days_known():

    profile = get_user_profile()

    if profile is None:

        return 0

    first_seen = datetime.strptime(
        profile[0],
        "%Y-%m-%d %H:%M:%S"
    )

    return (
        datetime.now() -
        first_seen
    ).days


# ----------------------------------------------------
# SEARCH PROFILE
# ----------------------------------------------------

def search_profile(keyword):

    cursor.execute("""
    SELECT
        key,
        value
    FROM profile_data
    WHERE
        key LIKE ?
        OR
        value LIKE ?
    """,
    (
        f"%{keyword}%",
        f"%{keyword}%"
    ))

    return cursor.fetchall()


# ----------------------------------------------------
# SHOW PROFILE
# ----------------------------------------------------

def show_profile():

    cursor.execute("""
    SELECT *
    FROM profile_data
    """)

    rows = cursor.fetchall()

    print("\n========== USER PROFILE ==========\n")

    for row in rows:

        print(
            row[0],
            " : ",
            row[1]
        )

    print("\n==================================")