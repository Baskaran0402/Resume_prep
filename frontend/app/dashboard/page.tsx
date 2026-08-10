import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResumeUpload from "@/components/ResumeUpload";

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
    .single();

  // Fetch target role from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("target_role")
    .eq("id", user.id)
    .single();

  const targetRole = profile?.target_role || "Not set yet";

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
        <div className="space-y-1">
          <p className="text-sm text-zinc-500">Welcome back 👋</p>
          <h1 className="text-3xl font-bold text-zinc-50">Your Interview Dashboard</h1>
          <p className="text-zinc-400 text-sm">{user.email}</p>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Readiness Score</p>
            <p className="text-4xl font-bold text-zinc-50">{resume ? "Pending" : "—"}</p>
            <p className="text-xs text-zinc-600">{resume ? "We are generating your score" : "Upload your resume to get started"}</p>
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
             <h2 className="text-xl font-bold text-zinc-50 mb-4">Resume Analyzed ✅</h2>
             <p className="text-zinc-400 text-sm mb-6">We've extracted {skillsCount} skills and {projectsCount} projects from your resume.</p>
             
             {/* If they want to re-upload, we can provide the component here too */}
             <div className="pt-6 border-t border-zinc-800">
               <p className="text-sm text-zinc-500 mb-3">Want to update your resume?</p>
               <ResumeUpload userId={user.id} />
             </div>
          </div>
        )}

      </div>
    </main>
  );
}
