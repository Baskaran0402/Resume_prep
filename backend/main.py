import os
from fastapi import FastAPI
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(
    title="Interview Intelligence API",
    description="Backend for the AI-Powered Resume Preparation Platform",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"status": "success", "message": "Welcome to the Interview Intelligence API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/test-db")
def test_db_connection():
    """Endpoint just to verify our client loaded the keys correctly"""
    return {
        "status": "success", 
        "message": "Supabase client successfully initialized!"
    }
