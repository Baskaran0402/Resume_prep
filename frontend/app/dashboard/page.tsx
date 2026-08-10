import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResumeUpload from "@/components/ResumeUpload";
import Link from "next/link";
import GenerateAnalysisButton from "./GenerateAnalysisButton";
import { FileUp, Target, Layers, ChevronRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("target_role")
    .eq("id", user.id)
    .single();

  const targetRole = profile?.target_role || "Not set yet";

  const { data: analysis } = await supabase
    .from("analysis_results")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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

  const readinessScore = analysis?.readiness_score;
  const scoreColor =
    readinessScore >= 80
      ? "text-green-500"
      : readinessScore >= 50
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-2xl font-bold mt-0.5">Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
          </div>
          <Link
            href="/interview"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors self-start sm:self-auto"
          >
            Interview Prep
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Readiness Score</p>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className={`text-4xl font-bold ${analysis ? scoreColor : "text-foreground"}`}>
              {analysis ? `${readinessScore}%` : resume ? "—" : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {analysis
                ? "Based on role expectations"
                : resume
                ? "Generate analysis to see score"
                : "Upload resume to get started"}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Target Role</p>
              <Layers className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold truncate" title={targetRole}>
              {targetRole}
            </p>
            <p className="text-xs text-muted-foreground">
              {targetRole !== "Not set yet" ? (
                <Link href="/profile" className="hover:underline text-primary">Edit in profile</Link>
              ) : (
                <Link href="/profile" className="hover:underline text-primary">Set your target role</Link>
              )}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Skills Extracted</p>
              <FileUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-4xl font-bold">{skillsCount}</p>
            <p className="text-xs text-muted-foreground">
              {resume ? `${projectsCount} projects detected` : "Upload a resume first"}
            </p>
          </div>
        </div>

        {/* Main content */}
        {!resume ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <FileUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No resume uploaded yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Upload your PDF resume to generate a personalized interview preparation plan.
              </p>
            </div>
            <ResumeUpload userId={user.id} />
          </div>
        ) : (
          <div className="space-y-6">
            {!analysis && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Resume parsed successfully</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Extracted {skillsCount} skills and {projectsCount} projects. Ready to generate your gap analysis.
                  </p>
                </div>
                <GenerateAnalysisButton userId={user.id} hasAnalysis={false} />
              </div>
            )}

            {analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priorities */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs text-muted-foreground uppercase tracking-widest">Top Priorities</h3>
                    <GenerateAnalysisButton userId={user.id} hasAnalysis={true} />
                  </div>
                  <div className="space-y-4">
                    {analysis.priorities?.map((p: any, idx: number) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">{p.topic}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              p.weight > 50
                                ? "bg-red-500/10 text-red-500"
                                : p.weight > 20
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-green-500/10 text-green-500"
                            }`}
                          >
                            {p.weight}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{p.reason}</p>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.weight > 50 ? "bg-red-500" : p.weight > 20 ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${p.weight}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown panels */}
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3 text-red-500">
                      Knowledge Gaps
                    </h3>
                    <ul className="space-y-2">
                      {analysis.gaps?.map((gap: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3 text-yellow-500">
                      Interview Risks
                    </h3>
                    <ul className="space-y-2">
                      {analysis.risks?.map((risk: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-3 text-green-500">
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {analysis.strengths?.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Resume update */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground mb-3">Update your resume</p>
              <ResumeUpload userId={user.id} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
