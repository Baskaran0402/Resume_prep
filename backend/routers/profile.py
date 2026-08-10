import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

supabase: Client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

class ProfileUpdate(BaseModel):
    user_id: str
    target_role: str
    experience_level: str
    target_company: str = ""
    job_description: str = ""

@router.post("/update")
async def update_profile(data: ProfileUpdate):
    try:
        # Check if profile exists
        existing = supabase.table("profiles").select("id").eq("id", data.user_id).execute()
        
        if existing.data and len(existing.data) > 0:
            # Update existing profile
            response = supabase.table("profiles").update({
                "target_role": data.target_role,
                "experience_level": data.experience_level,
                "target_company": data.target_company,
                "job_description": data.job_description
            }).eq("id", data.user_id).execute()
        else:
            # Insert new profile
            response = supabase.table("profiles").insert({
                "id": data.user_id,
                "target_role": data.target_role,
                "experience_level": data.experience_level,
                "target_company": data.target_company,
                "job_description": data.job_description
            }).execute()

        return {
            "status": "success",
            "message": "Profile updated successfully",
            "data": response.data
        }
    except Exception as e:
        print("====== PROFILE UPDATE ERROR ======")
        print(e)
        import traceback
        traceback.print_exc()
        print("==================================")
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")
