import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, GraduationCap, ArrowRight, Lightbulb, CheckCircle2 } from "lucide-react";
import GeneratePlanButton from "./GeneratePlanButton";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PreparePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: plan } = await supabase
    .from("study_plans")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <GraduationCap className="w-5 h-5" />
              <span className="font-medium tracking-wide uppercase text-xs">Learning Hub</span>
            </div>
            <h1 className="text-2xl font-bold">Preparation Planner</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your personalized study guide based on your latest Gap Analysis and Mock Interview weaknesses.
            </p>
          </div>
          <GeneratePlanButton
            userId={user.id}
            hasPlan={!!plan}
          />
        </div>

        {!plan ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No Study Plan Generated</p>
              <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
                We'll analyze your Job Description gaps and previous Mock Interview mistakes to build a custom syllabus for you.
              </p>
            </div>
            <GeneratePlanButton userId={user.id} hasPlan={false} />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Action Plan */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Action Plan
              </h2>
              <div className="space-y-3">
                {plan.action_plan?.map((step: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* High Priority Topics */}
            <div>
              <h2 className="text-lg font-semibold mb-4">High Priority Topics to Master</h2>
              <div className="grid grid-cols-1 gap-6">
                {plan.high_priority_topics?.map((topic: any, idx: number) => (
                  <div key={idx} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="bg-primary/5 p-4 border-b border-border">
                      <h3 className="font-semibold text-primary">{topic.topic}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{topic.reason}</p>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Key Concepts</h4>
                        <div className="flex flex-wrap gap-2">
                          {topic.key_concepts?.map((concept: string, cIdx: number) => (
                            <span key={cIdx} className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-full border border-zinc-700">
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Practice Questions</h4>
                        <ul className="space-y-2">
                          {topic.practice_questions?.map((q: string, qIdx: number) => (
                            <li key={qIdx} className="text-sm text-zinc-300 flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span> {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Link
                href="/interview"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
              >
                Test your knowledge in a Mock Interview
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
          </div>
        )}
      </div>
    </main>
  );
}
