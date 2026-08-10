# InterviewIQ 🧠

An **AI-Powered Interview Intelligence Engine** that transforms how candidates prepare for technical interviews. Instead of generic question banks, InterviewIQ creates a closed learning loop: it analyzes your resume against a target job description, discovers your knowledge gaps, builds a custom study plan, and ruthlessly tests your limits in an adaptive AI mock interview.

## 🚀 Features

- **Resume Parsing & Skill Extraction:** Upload a PDF resume and automatically extract key skills, projects, and experiences.
- **JD ↔ Resume Gap Analysis:** Paste a target Job Description to instantly receive a readiness score, priority study topics, and explicitly flagged knowledge gaps.
- **Preparation Planner:** Generates a highly customized, actionable Study Guide based on your JD gaps and past mock interview failures.
- **Adaptive AI Mock Interviews:** 
  - Starts at your exact experience level (L1 Fundamentals to L6 Behavioral).
  - Dynamically scales difficulty up or down based on how well you answer.
  - Employs strict, objective grading to prevent LLM "sycophancy" (generosity bias).
- **Progress Tracking & Weakness Radar:** Aggregates your performance across all mock interviews to visualize your score trend and highlight recurring weaknesses.

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Backend:** FastAPI, Python, Pydantic
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Auth)
- **AI / LLM:** Groq API (Llama 3.1 8B Instant)

## 📦 Setup Instructions

### 1. Supabase Setup
Create a new Supabase project and execute the following SQL in the SQL Editor to create the required tables:

```sql
-- Profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    target_role TEXT,
    experience_level TEXT,
    job_description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Plans
CREATE TABLE study_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    high_priority_topics JSONB DEFAULT '[]',
    action_plan JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own study plans" ON study_plans FOR ALL USING (auth.uid() = user_id);

-- Resumes, Skills, Projects, Analysis, Mock Interviews (Ensure these exist as per your schema)
```

### 2. Backend Setup
Navigate to the `backend` directory and set up your Python environment:

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
```

Run the FastAPI server:
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup
Navigate to the `frontend` directory and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the Next.js development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to start prepping!

## 📜 License

MIT License
