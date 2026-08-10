import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from collections import Counter

router = APIRouter(
    prefix="/progress",
    tags=["Progress"]
)

supabase: Client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

@router.get("/{user_id}")
async def get_progress(user_id: str):
    try:
        # Fetch all mock interviews for the user
        interviews_response = supabase.table("mock_interviews").select("id, created_at").eq("user_id", user_id).order("created_at", desc=False).execute()
        interviews = interviews_response.data
        
        if not interviews:
            return {
                "status": "success",
                "scores": [],
                "weaknesses": []
            }
            
        interview_ids = [i["id"] for i in interviews]
        
        # Fetch all messages with evaluations for these interviews
        messages_response = supabase.table("mock_interview_messages").select("interview_id, evaluation").in_("interview_id", interview_ids).neq("evaluation", "{}").execute()
        messages = messages_response.data
        
        # Aggregate scores per interview
        interview_scores = {}
        for i in interviews:
            interview_scores[i["id"]] = []
            
        all_missing_topics = []
            
        for msg in messages:
            eval_data = msg.get("evaluation")
            if eval_data:
                # Collect score
                score = eval_data.get("score")
                if score is not None:
                    interview_scores[msg["interview_id"]].append(score)
                
                # Collect missing topics
                missing = eval_data.get("missing_topics", [])
                if isinstance(missing, list):
                    all_missing_topics.extend(missing)
                    
        # Calculate average score per interview to show trend
        score_trend = []
        for i in interviews:
            scores = interview_scores[i["id"]]
            if scores:
                avg_score = sum(scores) / len(scores)
                score_trend.append(round(avg_score))
                
        # Calculate most frequent weaknesses
        topic_counts = Counter(all_missing_topics)
        top_weaknesses = [{"topic": k, "count": v} for k, v in topic_counts.most_common(5)]
        
        return {
            "status": "success",
            "scores": score_trend,
            "weaknesses": top_weaknesses
        }

    except Exception as e:
        print("====== GET PROGRESS ERROR ======")
        print(e)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
