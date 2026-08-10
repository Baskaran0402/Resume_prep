import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResumeUpload from "@/components/ResumeUpload";
import Link from "next/link";
import GenerateAnalysisButton from "./GenerateAnalysisButton";

export default async function DashboardPage() {
  // Server-side auth check — if not logged in, send to login
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch resume data
  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch target role from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("target_role")
    .eq("id", user.id)
    .single();

  const targetRole = profile?.target_role || "Not set yet";

  // Fetch gap analysis
  const { data: analysis } = await supabase
    .from("analysis_results")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch skill count if resume exists
  let skillsCount = 0;
  let projectsCount = 0;
  if (resume) {
    const { count: sCount } = await supabase
      .from("skills")
      .select("*", { count: "exact", head: true })
      .eq("resume_id", resume.id);
      
    const { count: pCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("resume_id", resume.id);
      
    skillsCount = sCount || 0;
    projectsCount = pCount || 0;
  }

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <div className="max-w-5xl mx-auto w-full px-6 py-12 space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm text-zinc-500">Welcome back 👋</p>
            <h1 className="text-3xl font-bold text-zinc-50">Your Interview Dashboard</h1>
            <p className="text-zinc-400 text-sm">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/interview" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              Interview Prep
            </Link>
            <Link href="/profile" className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors">
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Readiness Score</p>
            <p className="text-4xl font-bold text-zinc-50">{analysis ? `${analysis.readiness_score}%` : (resume ? "Pending" : "—")}</p>
            <p className="text-xs text-zinc-600">{analysis ? "Based on role expectations" : (resume ? "We are generating your score" : "Upload your resume to get started")}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Target Role</p>
            <p className="text-2xl font-bold text-zinc-50 truncate" title={targetRole}>{targetRole}</p>
            <p className="text-xs text-zinc-600">{targetRole !== "Not set yet" ? "From your profile" : "Not set yet"}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Skills Extracted</p>
            <p className="text-2xl font-bold text-zinc-50">{skillsCount}</p>
            <p className="text-xs text-zinc-600">{resume ? "Ready for technical review" : "Complete your profile first"}</p>
          </div>
        </div>

        {!resume ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-10 text-center space-y-3">
            <p className="text-zinc-300 font-medium">No resume uploaded yet</p>
            <p className="text-zinc-500 text-sm">Upload your resume to generate your personalized interview preparation plan</p>
            <ResumeUpload userId={user.id} />
          </div>
        ) : (
          <div className="space-y-6">
            {!analysis && (
              <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-8 text-center space-y-4">
                <h2 className="text-xl font-bold text-blue-100">Resume Analyzed ✅</h2>
                <p className="text-blue-200/70 text-sm">We've extracted {skillsCount} skills and {projectsCount} projects. We are ready to generate your customized gap analysis.</p>
                <div className="flex justify-center mt-4">
                  <GenerateAnalysisButton userId={user.id} hasAnalysis={false} />
                </div>
              </div>
            )}

            {analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priorities */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-sm text-zinc-500 uppercase tracking-widest mb-4">Your Top Priorities</h3>
                  <div className="space-y-4">
                    {analysis.priorities?.map((p: any, idx: number) => (
                      <div key={idx} className="flex flex-col space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-zinc-200">{p.topic}</span>
                          <span className={`text-xs px-2 py-1 rounded ${p.weight > 50 ? 'bg-red-500/20 text-red-400' : p.weight > 20 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                            {p.weight}% Focus
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{p.reason}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-zinc-800 pt-4 flex justify-between items-center">
                    <span className="text-xs text-zinc-600">Want to regenerate?</span>
                    <GenerateAnalysisButton userId={user.id} hasAnalysis={true} />
                  </div>
                </div>

                {/* Analysis Breakdown */}
                <div className="space-y-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-sm text-zinc-500 uppercase tracking-widest mb-4 text-red-400">Knowledge Gaps</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {analysis.gaps?.map((gap: string, idx: number) => (
                        <li key={idx} className="text-sm text-zinc-300">{gap}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-sm text-zinc-500 uppercase tracking-widest mb-4 text-yellow-400">Interview Risks</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {analysis.risks?.map((risk: string, idx: number) => (
                        <li key={idx} className="text-sm text-zinc-300">{risk}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-sm text-zinc-500 uppercase tracking-widest mb-4 text-green-400">Strengths</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {analysis.strengths?.map((strength: string, idx: number) => (
                        <li key={idx} className="text-sm text-zinc-300">{strength}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-8">
              <p className="text-sm text-zinc-500 mb-3">Want to update your resume?</p>
              <ResumeUpload userId={user.id} />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
