import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import GenerateQuestionsButton from "./GenerateQuestionsButton";
import StartMockInterviewButton from "./StartMockInterviewButton";
import { MessageSquare, BookOpen } from "lucide-react";

export default async function InterviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("user_id", user.id);

  const { data: mockInterviews } = await supabase
    .from("mock_interviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Mock Interview Arena</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Test your knowledge against a strict AI interviewer before the real thing.
            </p>
          </div>
          <GenerateQuestionsButton
            userId={user.id}
            hasQuestions={!!(questions && questions.length > 0)}
          />
        </div>

        {/* Mock interview section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">AI Mock Interviews</h2>
                <p className="text-muted-foreground text-sm mt-1 max-w-md">
                  Chat with an AI interviewer that evaluates your answers in real-time, finds weaknesses, and adapts difficulty automatically.
                </p>
              </div>
            </div>
            <StartMockInterviewButton userId={user.id} />
          </div>

          {mockInterviews && mockInterviews.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
                Past Sessions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockInterviews.map((session: any) => (
                  <Link
                    href={`/interview/${session.id}`}
                    key={session.id}
                    className="flex justify-between items-center bg-background border border-border hover:border-primary/40 rounded-lg p-4 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Session {session.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(session.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        session.status === "completed"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {session.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Question bank */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Question Bank</h2>
          </div>

          {!questions || questions.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center space-y-4">
              <p className="font-medium text-foreground">No questions generated yet</p>
              <p className="text-muted-foreground text-sm">
                We&apos;ll use your resume and target role to create tailored interview questions.
              </p>
              <GenerateQuestionsButton userId={user.id} hasQuestions={false} />
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q: any, idx: number) => (
                <div
                  key={q.id || idx}
                  className="bg-card border border-border rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        q.difficulty === "Hard"
                          ? "bg-red-500/10 text-red-500"
                          : q.difficulty === "Medium"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-green-500/10 text-green-500"
                      }`}
                    >
                      {q.difficulty || "Medium"}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {q.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-foreground leading-relaxed">
                    {q.question}
                  </h3>

                  {q.expected_topics && q.expected_topics.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                        Topics to cover
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {q.expected_topics.map((topic: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full"
                          >
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
