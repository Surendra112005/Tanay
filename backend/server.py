import os
import hmac
import secrets
# Fix duplicate OpenMP library issues on Windows
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# Force-import torch at the absolute beginning to prevent OpenBLAS/MKL collisions on Windows
try:
    import torch
except Exception as e:
    print("Warning: Failed to pre-import torch:", e)

# Try to load PyTorch dependent modules safely
tts_available = False
try:
    from tts.emotion_detector import detect_emotion
    from tts.generate_voice import generate_voice
    tts_available = True
    print("TTS and AI Emotion Detection models loaded successfully.")
except Exception as e:
    print("\n" + "=" * 60)
    print("WARNING: PyTorch modules failed to load (DLL initialization error).")
    print("Falling back to keyword-based emotion detection and disabling audio generation.")
    print("Error:", e)
    print("=" * 60 + "\n")
    
    # Fallback keyword emotion detector
    def detect_emotion(text):
        if not text:
            return "neutral"
        text = text.lower()
        happy_words = ["happy", "joy", "good", "great", "excellent", "wonderful"]
        sad_words = ["sad", "upset", "bad", "depressed", "cry"]
        angry_words = ["angry", "mad", "hate", "frustrated"]
        for w in happy_words:
            if w in text: return "joy"
        for w in sad_words:
            if w in text: return "sadness"
        for w in angry_words:
            if w in text: return "anger"
        return "neutral"

    # Fallback voice generator (does nothing)
    def generate_voice(*args, **kwargs):
        print("TTS Generation requested but PyTorch models are unavailable.")
        return ""

import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import pandas as pd
import io

# Core logic imports
from database.db_init import migrate_database
from speech.translator import translate_to_english
from brain.ai_brain import generate_response
from memory.memory_manager import get_recent_memories

# Setup directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database", "tanay.db")
SETTINGS_PATH = os.path.join(BASE_DIR, "database", "settings.json")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(OUTPUTS_DIR, exist_ok=True)

# Run database migrations on startup
migrate_database(DB_PATH)

app = FastAPI(title="Tanay AI Core server", version="1.0.0")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount outputs directory for audio playing
app.mount("/outputs", StaticFiles(directory=OUTPUTS_DIR), name="outputs")

# Helper to run database queries
def db_query(query: str, params: tuple = (), one: bool = False, commit: bool = False) -> Any:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute(query, params)
        if commit:
            conn.commit()
            return cursor.lastrowid
        else:
            rows = cursor.fetchall()
            if one:
                return rows[0] if rows else None
            return [dict(r) for r in rows]
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# Pydantic schemas
class ChatRequest(BaseModel):
    text: str
    language: str = "english"
    emotion: str = "auto"

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class FileSaveRequest(BaseModel):
    name: str
    content: str

# Default settings
DEFAULT_SETTINGS = {
    "system_prompt": "You are Tanay, a caring emotional AI companion.",
    "ollama_model": "qwen2.5:7b",
    "behavior_settings": {
        "creativity": 0.7,
        "empathy_factor": 0.9,
        "memory_retrieval_limit": 5
    },
    "tts_settings": {
        "voice": "Jenny",
        "speed": 1.0,
        "volume": 1.0,
        "enabled": True
    },
    "emotion_mappings": {
        "neutral": { "glow": "#9ca3af", "particle_count": 10 },
        "joy": { "glow": "#e5c048", "particle_count": 30 },
        "sadness": { "glow": "#3b82f6", "particle_count": 15 },
        "anger": { "glow": "#ef4444", "particle_count": 25 },
        "fear": { "glow": "#a855f7", "particle_count": 20 },
        "love": { "glow": "#ec4899", "particle_count": 40 },
        "lonely": { "glow": "#14b8a6", "particle_count": 12 },
        "stress": { "glow": "#f97316", "particle_count": 18 }
    }
}

def get_active_settings() -> dict:
    if os.path.exists(SETTINGS_PATH):
        try:
            with open(SETTINGS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print("Failed to load settings.json:", e)
    return DEFAULT_SETTINGS

# ================= USER CORE API =================

@app.post("/api/chat")
async def chat_endpoint(payload: ChatRequest):
    try:
        user_text = payload.text
        language = payload.language
        req_emotion = payload.emotion

        # 1. Translate if necessary
        english_text = translate_to_english(user_text)

        # 2. Detect emotion
        if req_emotion == "auto":
            emotion = detect_emotion(english_text)
        else:
            emotion = req_emotion

        # 3. Retrieve settings & memories
        settings = get_active_settings()
        limit = settings.get("behavior_settings", {}).get("memory_retrieval_limit", 5)
        recent_memories = get_recent_memories(limit=limit)

        # 4. Fetch relationship level
        rel_row = db_query("SELECT level, score, interactions_count FROM relationships WHERE user_id = 2", one=True)
        if not rel_row:
            db_query("""
            INSERT INTO relationships (user_id, level, score, interactions_count, created_at, updated_at)
            VALUES (2, 'Stranger', 10.0, 0, datetime('now'), datetime('now'))
            """, commit=True)
            rel_row = {"level": "Stranger", "score": 10.0, "interactions_count": 0}

        # 5. Generate AI reply
        reply = generate_response(
            user_text=english_text,
            emotion=emotion,
            memories=recent_memories,
            relationship=rel_row["level"],
            language=language
        )

        # 6. Save chat log
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db_query("""
        INSERT INTO chat_history (user_message, emotion, ai_reply, timestamp)
        VALUES (?, ?, ?, ?)
        """, (user_text, emotion, reply, now_str), commit=True)

        # 7. Update relationship stats
        new_interactions = rel_row["interactions_count"] + 1
        new_score = rel_row["score"] + 1.0
        
        # Calculate level based on interactions
        if new_interactions < 5:
            new_level = "Stranger"
        elif new_interactions < 15:
            new_level = "Friend"
        elif new_interactions < 30:
            new_level = "Close Friend"
        else:
            new_level = "Best Friend"

        db_query("""
        UPDATE relationships
        SET level = ?, score = ?, interactions_count = ?, updated_at = ?
        WHERE user_id = 2
        """, (new_level, new_score, new_interactions, now_str), commit=True)

        # 8. Generate TTS Audio file
        tts_enabled = settings.get("tts_settings", {}).get("enabled", True)
        audio_url = ""
        if tts_enabled and tts_available:
            audio_filename = f"response_{int(datetime.now().timestamp())}.wav"
            audio_path = os.path.join(OUTPUTS_DIR, audio_filename)
            generate_voice(
                text=reply,
                emotion=emotion,
                play_audio=False,
                file_path=audio_path
            )
            audio_url = f"/outputs/{audio_filename}"

        return {
            "reply": reply,
            "emotion": emotion,
            "relationship": new_level,
            "relationship_score": new_score,
            "audio": audio_url
        }

    except Exception as e:
        print("Chat endpoint failed:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/history")
async def chat_history_endpoint():
    try:
        rows = db_query("SELECT user_message, emotion, ai_reply, timestamp FROM chat_history ORDER BY id ASC")
        formatted = []
        for r in rows:
            formatted.append({
                "sender": "user",
                "text": r["user_message"],
                "timestamp": r["timestamp"]
            })
            formatted.append({
                "sender": "ai",
                "text": r["ai_reply"],
                "emotion": r["emotion"],
                "timestamp": r["timestamp"]
            })
        return formatted
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= ADMIN ACTIONS API =================

@app.post("/api/admin/login")
async def admin_login(payload: AdminLoginRequest):
    admin_username = os.getenv("TANAY_ADMIN_USERNAME")
    admin_password = os.getenv("TANAY_ADMIN_PASSWORD")
    if not admin_username or not admin_password:
        raise HTTPException(status_code=503, detail="Admin login is not configured")
    username_matches = hmac.compare_digest(
        payload.username.encode("utf-8"), admin_username.encode("utf-8")
    )
    password_matches = hmac.compare_digest(
        payload.password.encode("utf-8"), admin_password.encode("utf-8")
    )
    if username_matches and password_matches:
        return {
            "status": "success",
            "token": secrets.token_urlsafe(32)
        }
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

@app.get("/api/admin/files")
async def get_editable_files():
    target_files = [
        "main.py",
        "brain/ai_brain.py",
        "brain/knowledge.py",
        "memory/memory_manager.py",
        "memory/profile_extractor.py",
        "memory/profile_manager.py",
        "memory/relationship_manager.py",
        "tts/generate_voice.py",
        "tts/emotion_detector.py",
        "tts/voice_settings.py"
    ]
    results = []
    for tf in target_files:
        full_path = os.path.join(BASE_DIR, tf)
        if os.path.exists(full_path):
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()
                results.append({
                    "name": tf,
                    "content": content
                })
            except Exception as e:
                print(f"Failed to read file {tf}: {e}")
    return results

@app.post("/api/admin/files/save")
async def save_editable_file(payload: FileSaveRequest):
    # Verify file name is within permitted list
    permitted = [
        "main.py",
        "brain/ai_brain.py",
        "brain/knowledge.py",
        "memory/memory_manager.py",
        "memory/profile_extractor.py",
        "memory/profile_manager.py",
        "memory/relationship_manager.py",
        "tts/generate_voice.py",
        "tts/emotion_detector.py",
        "tts/voice_settings.py"
    ]
    if payload.name not in permitted:
        raise HTTPException(status_code=403, detail="File edit is not authorized.")
    
    full_path = os.path.join(BASE_DIR, payload.name)
    try:
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(payload.content)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/settings")
async def get_settings():
    return get_active_settings()

@app.post("/api/admin/settings")
async def save_settings(payload: Dict[str, Any]):
    try:
        with open(SETTINGS_PATH, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= DATABASE VIEWER CRUD API =================

ALLOWED_TABLES = ["users", "memories", "relationships", "profiles"]

@app.get("/api/admin/db/{table_name}")
async def get_db_table(table_name: str):
    if table_name not in ALLOWED_TABLES:
        raise HTTPException(status_code=403, detail="Table access not allowed")
    try:
        rows = db_query(f"SELECT * FROM {table_name}")
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/db/{table_name}/update")
async def update_db_row(table_name: str, payload: Dict[str, Any]):
    if table_name not in ALLOWED_TABLES:
        raise HTTPException(status_code=403, detail="Table edit not allowed")
    
    if "id" not in payload:
        raise HTTPException(status_code=400, detail="Missing record ID for update")
    
    try:
        # Build query dynamically
        columns = [k for k in payload.keys()]
        placeholders = [f"{col} = ?" for col in columns]
        query = f"INSERT OR REPLACE INTO {table_name} ({', '.join(columns)}) VALUES ({', '.join(['?'] * len(columns))})"
        values = tuple(payload[col] for col in columns)
        
        db_query(query, values, commit=True)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/db/{table_name}/{id}")
async def delete_db_row(table_name: str, id: int):
    if table_name not in ALLOWED_TABLES:
        raise HTTPException(status_code=403, detail="Table deletion not allowed")
    try:
        db_query(f"DELETE FROM {table_name} WHERE id = ?", (id,), commit=True)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/db/{table_name}/export")
async def export_db_table(table_name: str):
    if table_name not in ALLOWED_TABLES:
        raise HTTPException(status_code=403, detail="Table export not allowed")
    try:
        rows = db_query(f"SELECT * FROM {table_name}")
        df = pd.DataFrame(rows)
        
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        response = StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = f"attachment; filename={table_name}_export.csv"
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= DIAGNOSTICS & ANALYTICS API =================

@app.get("/api/admin/analytics")
async def get_analytics():
    try:
        # Total users
        user_count_row = db_query("SELECT COUNT(*) as count FROM users", one=True)
        total_users = user_count_row["count"] if user_count_row else 0
        
        # Total chats
        chat_count_row = db_query("SELECT COUNT(*) as count FROM chat_history", one=True)
        total_conversations = chat_count_row["count"] if chat_count_row else 0
        
        # Most used emotion
        emotion_row = db_query("""
            SELECT emotion, COUNT(*) as count 
            FROM chat_history 
            GROUP BY emotion 
            ORDER BY count DESC 
            LIMIT 1
        """, one=True)
        most_used_emotion = emotion_row["emotion"] if emotion_row else "neutral"
        
        # Relationship distribution
        rel_rows = db_query("SELECT level, COUNT(*) as count FROM relationships GROUP BY level")
        # Ensure standard keys are present
        rel_map = {"Stranger": 0, "Friend": 0, "Close Friend": 0, "Best Friend": 0}
        for r in rel_rows:
            if r["level"] in rel_map:
                rel_map[r["level"]] = r["count"]
        relationship_distribution = [{"name": k, "value": v} for k, v in rel_map.items()]
        
        # Chat activity past 7 days
        chat_activity = []
        today = datetime.now()
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_str = day.strftime("%m-%d")
            day_db_pattern = day.strftime("%Y-%m-%d")
            count_row = db_query("SELECT COUNT(*) as count FROM chat_history WHERE timestamp LIKE ?", (f"{day_db_pattern}%",), one=True)
            chat_activity.append({
                "date": day_str,
                "chats": count_row["count"] if count_row else 0
            })
            
        # Emotion usage share
        emotion_rows = db_query("SELECT emotion, COUNT(*) as count FROM chat_history GROUP BY emotion")
        emotion_usage = []
        for er in emotion_rows:
            emotion_usage.append({
                "name": er["emotion"].capitalize(),
                "value": er["count"]
            })
        if not emotion_usage:
            emotion_usage = [{"name": "Neutral", "value": 1}]
            
        # Language usage share
        lang_rows = db_query("SELECT language, COUNT(*) as count FROM profiles GROUP BY language")
        language_usage = []
        for lr in lang_rows:
            language_usage.append({
                "name": lr["language"].capitalize(),
                "value": lr["count"]
            })
        if not language_usage:
            language_usage = [{"name": "English", "value": 1}]
            
        return {
            "total_users": total_users,
            "total_conversations": total_conversations,
            "most_used_emotion": most_used_emotion,
            "relationship_distribution": relationship_distribution,
            "chat_activity": chat_activity,
            "emotion_usage": emotion_usage,
            "language_usage": language_usage
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="localhost", port=8000, reload=False)
