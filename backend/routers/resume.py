import os
import io
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import PyPDF2
from groq import Groq
from supabase import create_client, Client

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)

supabase: Client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))


client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@router.get("/")
def get_resume():
    return {"message": "Resume API is running"}

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        content = await file.read()
        
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
            
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF")
            
        system_prompt = """
        You are an expert AI resume parser. Extract the following information from the provided resume text and return it strictly as a JSON object:
        {
          "skills": [
            {"name": "Skill Name", "category": "Language, Framework, Tool, etc."}
          ],
          "projects": [
            {
              "name": "Project or Role Name",
              "description": "Brief description",
              "technologies": ["React", "Python", "etc"],
              "claims": {"impact": "Increased sales by 20%", "other_metrics": "..."}
            }
          ]
        }
        Only return the JSON object, no markdown, no other text.
        """
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": text,
                }
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},
        )
        
        parsed_data = json.loads(chat_completion.choices[0].message.content)
        
        # Save to Supabase according to relational schema
        
        # 1. Insert/Update into resumes table without relying on ON CONFLICT
        # First check if the user already has a resume
        existing_resume = supabase.table("resumes").select("id").eq("user_id", user_id).execute()
        
        if existing_resume.data and len(existing_resume.data) > 0:
            resume_id = existing_resume.data[0]["id"]
            supabase.table("resumes").update({"parsed_status": "completed"}).eq("id", resume_id).execute()
        else:
            new_resume = supabase.table("resumes").insert({
                "user_id": user_id,
                "parsed_status": "completed"
            }).execute()
            resume_id = new_resume.data[0]["id"]
        
        # 2. Insert Skills
        skills_data = parsed_data.get("skills", [])
        if skills_data:
            # Add resume_id to each skill
            for skill in skills_data:
                skill["resume_id"] = resume_id
            # Delete existing skills for this resume to avoid duplicates on re-upload
            supabase.table("skills").delete().eq("resume_id", resume_id).execute()
            supabase.table("skills").insert(skills_data).execute()
            
        # 3. Insert Projects
        projects_data = parsed_data.get("projects", [])
        if projects_data:
            for project in projects_data:
                project["resume_id"] = resume_id
            # Delete existing projects for this resume
            supabase.table("projects").delete().eq("resume_id", resume_id).execute()
            supabase.table("projects").insert(projects_data).execute()
        
        return {
            "status": "success",
            "message": "Resume parsed and saved successfully",
            "data": parsed_data
        }
        
    except Exception as e:
        print("====== UPLOAD ERROR ======")
        print(e)
        import traceback
        traceback.print_exc()
        print("==========================")
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")
