import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables before importing routers
load_dotenv()

from supabase import create_client, Client
from routers import resume, profile, interview, analysis, mock_interview
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(
    title="Interview Intelligence API",
    description="Backend for the AI-Powered Resume Preparation Platform",
    version="1.0.0"
)

# Allow our Next.js frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(resume.router)
app.include_router(profile.router)
app.include_router(interview.router)
app.include_router(analysis.router)
app.include_router(mock_interview.router)

@app.get("/")
def read_root():
    return {"status": "success", "message": "Welcome to the Interview Intelligence API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
