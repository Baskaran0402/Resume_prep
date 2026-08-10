import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MockInterviewClient from "./MockInterviewClient";

export default async function MockInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch the interview session
  const { data: interview, error: interviewError } = await supabase
    .from("mock_interviews")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (interviewError || !interview) {
    redirect("/dashboard");
  }

  // Fetch past messages for this session
  const { data: messages } = await supabase
    .from("mock_interview_messages")
    .select("*")
    .eq("interview_id", id)
    .order("created_at", { ascending: true });

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <MockInterviewClient 
        interviewId={id} 
        initialMessages={messages || []} 
        userId={user.id} 
      />
    </main>
  );
}
