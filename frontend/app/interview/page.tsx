import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import GenerateQuestionsButton from "./GenerateQuestionsButton";

export default async function InterviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch generated questions
  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("user_id", user.id);

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 py-12 px-6">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div>
          <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors text-sm mb-6 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Interview Prep</h1>
              <p className="text-zinc-400 mt-2">
                Personalized questions generated from your resume and profile.
              </p>
            </div>
            <GenerateQuestionsButton userId={user.id} hasQuestions={questions && questions.length > 0} />
          </div>
        </div>

        {!questions || questions.length === 0 ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-12 text-center space-y-4">
            <h2 className="text-xl font-medium text-zinc-300">No questions generated yet.</h2>
            <p className="text-zinc-500">We'll use your parsed resume and target role to create highly tailored interview questions.</p>
            <div className="mt-6 inline-block">
               <GenerateQuestionsButton userId={user.id} hasQuestions={false} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q: any, idx: number) => (
              <div key={q.id || idx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded ${
                    q.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' :
                    q.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {q.difficulty || "Medium"}
                  </span>
                  <span className="text-xs text-zinc-500 uppercase tracking-widest">{q.category}</span>
                </div>
                <h3 className="text-lg font-medium text-zinc-100">{q.question}</h3>
                
                {q.expected_topics && q.expected_topics.length > 0 && (
                  <div className="pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Things to mention:</p>
                    <div className="flex flex-wrap gap-2">
                      {q.expected_topics.map((topic: string, tIdx: number) => (
                        <span key={tIdx} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
