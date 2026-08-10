import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/interview",
    tags=["Interview"]
)

supabase: Client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class GenerateRequest(BaseModel):
    user_id: str

@router.post("/generate")
async def generate_questions(request: GenerateRequest):
    try:
        user_id = request.user_id

        # 1. Fetch User Profile
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not profile_response.data:
            raise HTTPException(status_code=404, detail="Profile not found. Please complete your profile first.")
        profile = profile_response.data[0]

        # 2. Fetch parsed resume data
        resume_response = supabase.table("resumes").select("id").eq("user_id", user_id).execute()
        if not resume_response.data:
            raise HTTPException(status_code=404, detail="Resume not found. Please upload a resume first.")
        resume_id = resume_response.data[0]["id"]

        skills_response = supabase.table("skills").select("name, category").eq("resume_id", resume_id).execute()
        projects_response = supabase.table("projects").select("name, description, technologies").eq("resume_id", resume_id).execute()

        skills = [s["name"] for s in skills_response.data] if skills_response.data else []
        projects = projects_response.data if projects_response.data else []

        # 3. Construct prompt for Groq
        system_prompt = """
        You are an expert technical interviewer for top tech companies. 
        Generate exactly 5 tailored interview questions based on the candidate's profile, skills, and projects.
        The questions should be a mix of technical deep-dives into their projects and core concepts related to their skills.
        
        Return ONLY a JSON object with this exact structure, no markdown, no explanation:
        {
          "questions": [
            {
              "category": "Technical or Behavioral or Project",
              "question": "The interview question text",
              "expected_topics": ["Topic 1", "Topic 2", "Topic 3"],
              "difficulty": "Medium or Hard"
            }
          ]
        }
        """

        user_content = f"""
        TARGET ROLE: {profile.get('target_role', 'Software Engineer')}
        EXPERIENCE LEVEL: {profile.get('experience_level', 'Mid-Level')}
        TARGET COMPANY: {profile.get('target_company', 'Any tech company')}

        CANDIDATE SKILLS:
        {', '.join(skills)}

        CANDIDATE PROJECTS:
        {json.dumps(projects, indent=2)}
        """

        # 4. Call LLM
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},
        )

        response_content = chat_completion.choices[0].message.content
        parsed_data = json.loads(response_content)

        questions = parsed_data.get("questions", [])
        
        # 5. Save to database
        db_questions = []
        for q in questions:
            db_questions.append({
                "user_id": user_id,
                "category": q.get("category", "Technical"),
                "question": q.get("question", ""),
                "expected_topics": q.get("expected_topics", []),
                "difficulty": q.get("difficulty", "Medium")
            })

        # Clear old questions for this user before inserting new ones
        supabase.table("questions").delete().eq("user_id", user_id).execute()
        
        if db_questions:
            supabase.table("questions").insert(db_questions).execute()

        return {
            "status": "success",
            "message": f"Generated {len(questions)} questions.",
            "data": db_questions
        }

    except Exception as e:
        print("====== GENERATE QUESTIONS ERROR ======")
        print(e)
        import traceback
        traceback.print_exc()
        print("======================================")
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

@router.get("/list/{user_id}")
async def list_questions(user_id: str):
    try:
        response = supabase.table("questions").select("*").eq("user_id", user_id).execute()
        return {
            "status": "success",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
