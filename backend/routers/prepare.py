import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from groq import Groq
from dotenv import load_dotenv
from collections import Counter

load_dotenv()

router = APIRouter(
    prefix="/prepare",
    tags=["Prepare"]
)

supabase: Client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class GeneratePlanRequest(BaseModel):
    user_id: str

@router.post("/generate")
async def generate_plan(request: GeneratePlanRequest):
    try:
        user_id = request.user_id

        # 1. Fetch User Profile
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not profile_response.data:
            raise HTTPException(status_code=404, detail="Profile not found.")
        profile = profile_response.data[0]

        # 2. Fetch Gap Analysis
        analysis_response = supabase.table("analysis_results").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        analysis = analysis_response.data[0] if analysis_response.data else {}

        # 3. Fetch Progress / Weaknesses
        interviews_response = supabase.table("mock_interviews").select("id").eq("user_id", user_id).execute()
        interviews = interviews_response.data
        
        top_weaknesses = []
        if interviews:
            interview_ids = [i["id"] for i in interviews]
            messages_response = supabase.table("mock_interview_messages").select("evaluation").in_("interview_id", interview_ids).neq("evaluation", "{}").execute()
            messages = messages_response.data
            
            all_missing = []
            for msg in messages:
                eval_data = msg.get("evaluation")
                if eval_data:
                    missing = eval_data.get("missing_topics", [])
                    if isinstance(missing, list):
                        all_missing.extend(missing)
                        
            topic_counts = Counter(all_missing)
            top_weaknesses = [{"topic": k, "count": v} for k, v in topic_counts.most_common(5)]

        # 4. Construct System Prompt
        system_prompt = """
        You are an expert AI Technical Interview Coach. 
        Your goal is to build a highly actionable, personalized Study Plan for the candidate based on their Gap Analysis and the mistakes they made in recent Mock Interviews.
        
        Output exactly a JSON object matching this structure:
        {
          "high_priority_topics": [
            {
              "topic": "Topic Name",
              "reason": "Why they need to study this (e.g. missed 3 times in mock interviews, or required by JD).",
              "key_concepts": ["Concept 1", "Concept 2", "Concept 3"],
              "practice_questions": [
                "A hard practice question they should be able to answer",
                "Another practice question"
              ]
            }
          ],
          "action_plan": [
            "Step 1: Specific action",
            "Step 2: Specific action"
          ]
        }
        """
        
        user_content = f"""
        TARGET ROLE: {profile.get('target_role', 'Software Engineer')}
        EXPERIENCE LEVEL: {profile.get('experience_level', 'Mid-Level')}
        JOB DESCRIPTION: {profile.get('job_description', 'Not provided')}
        
        GAP ANALYSIS PRIORITIES:
        {json.dumps(analysis.get('priorities', []), indent=2)}
        
        MOCK INTERVIEW RECURRING WEAKNESSES:
        {json.dumps(top_weaknesses, indent=2)}
        """

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},
        )

        response_content = json.loads(chat_completion.choices[0].message.content)
        
        # 5. Save to database
        db_record = {
            "user_id": user_id,
            "high_priority_topics": response_content.get("high_priority_topics", []),
            "action_plan": response_content.get("action_plan", [])
        }

        existing = supabase.table("study_plans").select("id").eq("user_id", user_id).execute()
        if existing.data:
            supabase.table("study_plans").update(db_record).eq("user_id", user_id).execute()
        else:
            supabase.table("study_plans").insert(db_record).execute()

        return {
            "status": "success",
            "message": "Study Plan generated successfully.",
            "data": db_record
        }

    except Exception as e:
        print("====== GENERATE PLAN ERROR ======")
        print(e)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}")
async def get_plan(user_id: str):
    try:
        response = supabase.table("study_plans").select("*").eq("user_id", user_id).execute()
        return {
            "status": "success",
            "data": response.data[0] if response.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
