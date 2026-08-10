import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import GenerateQuestionsButton from "./GenerateQuestionsButton";
import StartMockInterviewButton from "./StartMockInterviewButton";

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

  // Fetch past mock interviews
  const { data: mockInterviews } = await supabase
    .from("mock_interviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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

        {/* Mock Interview Hub */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-50">Interactive Mock Interviews</h2>
              <p className="text-zinc-400 text-sm mt-2 max-w-lg">
                Engage in a dynamic chat with our AI Interview Coach. It evaluates your answers in real-time, finds your weaknesses, and scales difficulty automatically.
              </p>
            </div>
            <StartMockInterviewButton userId={user.id} />
          </div>

          {mockInterviews && mockInterviews.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-800">
              <h3 className="text-sm text-zinc-500 uppercase tracking-widest mb-4">Past Sessions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockInterviews.map((session: any) => (
                  <Link href={`/interview/${session.id}`} key={session.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg p-4 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-300">Session {session.id.slice(0, 6)}</span>
                      <span className="text-xs text-zinc-500 mt-1">{new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${session.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {session.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-8">
          <h2 className="text-xl font-bold text-zinc-50 mb-6">Static Question Bank</h2>
          
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
      </div>
    </main>
  );
}
