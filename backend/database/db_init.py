import sqlite3
import os
from datetime import datetime

def migrate_database(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Check if memories table exists and uses the old schema (conversation logs)
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='memories'")
    memories_exists = cursor.fetchone()
    
    rename_old_memories = False
    if memories_exists:
        cursor.execute("PRAGMA table_info(memories)")
        columns = [col[1] for col in cursor.fetchall()]
        if 'user_message' in columns:
            rename_old_memories = True
            
    if rename_old_memories:
        print("Migrating old 'memories' table to 'chat_history'...")
        # Check if chat_history already exists, if so drop it first
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='chat_history'")
        if cursor.fetchone():
            cursor.execute("DROP TABLE chat_history")
        cursor.execute("ALTER TABLE memories RENAME TO chat_history")
        conn.commit()
        
    # 2. Create chat_history if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_message TEXT,
        emotion TEXT,
        ai_reply TEXT,
        timestamp TEXT
    )
    """)
    
    # 3. Create new memories (extracted facts) table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        importance INTEGER,
        emotion TEXT,
        created_at TEXT
    )
    """)
    
    # 4. Create users table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        role TEXT,
        created_at TEXT
    )
    """)
    
    # Seed default users
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("INSERT OR IGNORE INTO users (id, username, role, created_at) VALUES (1, 'admin', 'admin', ?)", (now_str,))
    cursor.execute("INSERT OR IGNORE INTO users (id, username, role, created_at) VALUES (2, 'Alex Mercer', 'user', ?)", (now_str,))
    
    # 5. Create profiles table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        display_name TEXT,
        language TEXT,
        bio TEXT,
        avatar_url TEXT,
        created_at TEXT,
        updated_at TEXT
    )
    """)
    
    # Seed default profile for standard user
    cursor.execute("""
    INSERT OR IGNORE INTO profiles (id, user_id, display_name, language, bio, avatar_url, created_at, updated_at)
    VALUES (2, 2, 'Alex Mercer', 'english', 'A tech enthusiast exploring the frontiers of human-AI emotional connection.', '/assets/default_avatar.png', ?, ?)
    """, (now_str, now_str))
    
    # 6. Create relationships table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        level TEXT,
        score REAL,
        interactions_count INTEGER,
        created_at TEXT,
        updated_at TEXT
    )
    """)
    
    # Attempt to read conversation count and trust score from old relationship table
    conversation_count = 0
    trust_score = 10.0
    try:
        cursor.execute("SELECT conversation_count, trust_score FROM relationship WHERE id=1")
        row = cursor.fetchone()
        if row:
            conversation_count = row[0]
            trust_score = float(row[1])
    except Exception as e:
        print("Could not read from old relationship table:", e)
        
    def get_relationship_level_name(count):
        if count < 5: return "Stranger"
        elif count < 15: return "Friend"
        elif count < 30: return "Close Friend"
        else: return "Best Friend"
        
    level = get_relationship_level_name(conversation_count)
    
    # Seed default relationship status
    cursor.execute("""
    INSERT OR IGNORE INTO relationships (id, user_id, level, score, interactions_count, created_at, updated_at)
    VALUES (2, 2, ?, ?, ?, ?, ?)
    """, (level, trust_score, conversation_count, now_str, now_str))
    
    conn.commit()
    conn.close()
    print("Database migration check completed successfully.")

if __name__ == "__main__":
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database", "tanay.db")
    migrate_database(db_path)
