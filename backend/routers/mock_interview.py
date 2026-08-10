import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/mock",
    tags=["MockInterview"]
)

supabase: Client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class StartInterviewRequest(BaseModel):
    user_id: str

class ChatMessageRequest(BaseModel):
    user_id: str
    interview_id: str
    answer: str

@router.post("/start")
async def start_interview(request: StartInterviewRequest):
    try:
        user_id = request.user_id

        # 1. Fetch User Profile & Analysis
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not profile_response.data:
            raise HTTPException(status_code=404, detail="Profile not found.")
        profile = profile_response.data[0]

        analysis_response = supabase.table("analysis_results").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        analysis = analysis_response.data[0] if analysis_response.data else {}

        # 2. Create Interview Session
        new_interview = supabase.table("mock_interviews").insert({
            "user_id": user_id,
            "status": "in_progress"
        }).execute()
        interview_id = new_interview.data[0]["id"]

        # 3. Construct prompt for first question
        system_prompt = f"""
        You are an expert AI Technical Interviewer conducting a mock interview.
        You MUST tailor your question STRICTLY to the candidate's Experience Level: {profile.get('experience_level', 'Entry-Level/Junior')}.
        
        If they are Junior/Entry-Level, DO NOT ask complex System Design questions. Start with L1 (Fundamental Concepts) or L2 (Practical Application).
        If they are Senior, you may start at L3 (Architectural/System Design).
        
        Based on the candidate's target role, experience level, and knowledge gaps/priorities, ask the FIRST interview question.
        
        Return exactly a JSON object:
        {{
          "question": "Your first interview question here"
        }}
        """

        user_content = f"""
        TARGET ROLE: {profile.get('target_role', 'Software Engineer')}
        EXPERIENCE LEVEL: {profile.get('experience_level', 'Mid-Level')}
        
        CANDIDATE PRIORITIES & GAPS:
        {json.dumps(analysis.get('priorities', []), indent=2)}
        {json.dumps(analysis.get('gaps', []), indent=2)}
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
        first_question = response_content.get("question", "Let's start by discussing your background. Can you tell me about yourself?")

        # 4. Save first message
        message = supabase.table("mock_interview_messages").insert({
            "interview_id": interview_id,
            "role": "assistant",
            "content": first_question
        }).execute()

        return {
            "status": "success",
            "interview_id": interview_id,
            "first_question": first_question
        }

    except Exception as e:
        print("====== START MOCK INTERVIEW ERROR ======")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
async def chat_interview(request: ChatMessageRequest):
    try:
        user_id = request.user_id
        interview_id = request.interview_id
        answer = request.answer

        # 1. Fetch User Profile for context
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        profile = profile_response.data[0] if profile_response.data else {}

        # 2. Save user answer
        supabase.table("mock_interview_messages").insert({
            "interview_id": interview_id,
            "role": "user",
            "content": answer
        }).execute()

        # 2. Fetch Chat History (last 6 messages to save tokens)
        history_response = supabase.table("mock_interview_messages").select("*").eq("interview_id", interview_id).order("created_at", desc=False).execute()
        history = history_response.data[-6:] if history_response.data else []

        # 4. Construct prompt for Evaluation + Next Question
        system_prompt = f"""
        You are an expert AI Technical Interviewer.
        The candidate's Experience Level is: {profile.get('experience_level', 'Entry-Level/Junior')}.
        
        You must evaluate the candidate's last answer and then ask the NEXT question.
        
        DYNAMIC SCALING RULES (L1 to L6):
        - L1: Core fundamentals (What is X?)
        - L2: Practical application (How do you use X?)
        - L3: Architecture/Design (How do you build a system with X?)
        - L4: Trade-offs/Optimization (Why X over Y? How to scale X?)
        - L5: Debugging/Failure (What happens when X fails?)
        - L6: Cultural/Behavioral (Tell me about a time you used X)
        
        If their answer was weak, drop down a level (e.g., L3 -> L2) to rebuild confidence.
        If their answer was strong, move up a level (e.g., L2 -> L3) to test their limits.
        
        CRITICAL: Never ask an L3/L4 System Design question to a Junior/Entry-Level candidate unless they have perfectly answered L1 and L2 questions. Adapt to their level!

        Output exactly a JSON object:
        {{
          "evaluation": {{
            "score": 85,
            "feedback": "Constructive feedback on what they did well and what they missed.",
            "missing_topics": ["Topic 1"]
          }},
          "next_question": "Your next interview question to the candidate."
        }}
        """

        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})

        chat_completion = groq_client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},
        )

        response_content = json.loads(chat_completion.choices[0].message.content)
        evaluation = response_content.get("evaluation", {})
        next_question = response_content.get("next_question", "Thank you. Let's move on.")

        # 4. Update the user's message with its evaluation (we actually save it in the assistant's response or a new message, but let's save the evaluation attached to the assistant's NEXT message for UI simplicity, OR attached to the user's message).
        # Actually, it's better to store the evaluation inside the assistant's new message so the UI can show: User -> Assistant (shows evaluation of previous, then asks next question)
        
        supabase.table("mock_interview_messages").insert({
            "interview_id": interview_id,
            "role": "assistant",
            "content": next_question,
            "evaluation": evaluation
        }).execute()

        return {
            "status": "success",
            "evaluation": evaluation,
            "next_question": next_question
        }

    except Exception as e:
        print("====== CHAT MOCK INTERVIEW ERROR ======")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{interview_id}")
async def get_interview(interview_id: str):
    try:
        messages = supabase.table("mock_interview_messages").select("*").eq("interview_id", interview_id).order("created_at", desc=False).execute()
        return {
            "status": "success",
            "messages": messages.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
