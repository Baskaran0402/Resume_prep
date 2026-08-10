import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"]
)

supabase: Client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class GenerateRequest(BaseModel):
    user_id: str

@router.post("/generate")
async def generate_analysis(request: GenerateRequest):
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
        projects_response = supabase.table("projects").select("name, description, technologies, claims").eq("resume_id", resume_id).execute()

        skills = [s["name"] for s in skills_response.data] if skills_response.data else []
        projects = projects_response.data if projects_response.data else []

        # 3. Construct prompt for Groq (The gap analysis engine)
        system_prompt = """
        You are a Senior AI Product Architect and Expert Technical Interviewer.
        Your task is to analyze a candidate's profile, resume, and experience level, and compare it to the industry expectations for their target role.

        You must output a JSON object containing a deep Gap Analysis with the following exact structure (no markdown, no explanation):
        {
          "readiness_score": 75, // integer from 0 to 100 based on how well they match expectations
          "strengths": [
            "Strength 1 (What they already demonstrate)",
            "Strength 2"
          ],
          "risks": [
            "Risk 1 (Areas they claim but might struggle to defend, e.g. claiming 99% accuracy)",
            "Risk 2"
          ],
          "gaps": [
            "Gap 1 (Important role expectations that are missing or weak)",
            "Gap 2"
          ],
          "priorities": [
            {
              "topic": "Topic Name",
              "weight": 25, // Percentage weight of how important this is to study right now
              "reason": "Why they need to study this based on their gaps or role expectations."
            }
          ]
        }
        
        CRITICAL RULES:
        1. A "Fresher" expects fundamentals. A "Senior" expects architecture, scale, and system design.
        2. Identify if they claim technologies in projects but don't list them in skills.
        3. Prioritize missing core technologies for their role.
        4. If a JOB DESCRIPTION is provided, you MUST perform a Resume ↔ JD Match. Flag any explicitly required skills in the JD that are completely missing from the Resume as high-priority gaps.
        """

        user_content = f"""
        TARGET ROLE: {profile.get('target_role', 'Software Engineer')}
        EXPERIENCE LEVEL: {profile.get('experience_level', 'Mid-Level')}
        TARGET COMPANY: {profile.get('target_company', 'Any tech company')}
        
        JOB DESCRIPTION (If provided, match against this strictly):
        {profile.get('job_description', 'Not provided - evaluate against general industry standards for the role')}

        CANDIDATE SKILLS EXTRACTED FROM RESUME:
        {', '.join(skills)}

        CANDIDATE PROJECTS EXTRACTED FROM RESUME:
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
        
        # 5. Save to database
        db_record = {
            "user_id": user_id,
            "readiness_score": parsed_data.get("readiness_score", 0),
            "strengths": parsed_data.get("strengths", []),
            "risks": parsed_data.get("risks", []),
            "gaps": parsed_data.get("gaps", []),
            "priorities": parsed_data.get("priorities", [])
        }

        # Check if record exists
        existing = supabase.table("analysis_results").select("id").eq("user_id", user_id).execute()
        if existing.data:
            supabase.table("analysis_results").update(db_record).eq("user_id", user_id).execute()
        else:
            supabase.table("analysis_results").insert(db_record).execute()

        return {
            "status": "success",
            "message": "Gap Analysis generated successfully.",
            "data": db_record
        }

    except Exception as e:
        print("====== GENERATE ANALYSIS ERROR ======")
        print(e)
        import traceback
        traceback.print_exc()
        print("======================================")
        raise HTTPException(status_code=500, detail=f"Error generating analysis: {str(e)}")

@router.get("/result/{user_id}")
async def get_analysis(user_id: str):
    try:
        response = supabase.table("analysis_results").select("*").eq("user_id", user_id).execute()
        return {
            "status": "success",
            "data": response.data[0] if response.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
