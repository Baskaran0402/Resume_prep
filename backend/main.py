from fastapi import FastAPI

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
