import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MockInterviewClient from "./MockInterviewClient";

export default async function MockInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: interview, error: interviewError } = await supabase
    .from("mock_interviews")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (interviewError || !interview) redirect("/dashboard");

  const { data: messages } = await supabase
    .from("mock_interview_messages")
    .select("*")
    .eq("interview_id", id)
    .order("created_at", { ascending: true });

  return (
    <main className="flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
      <MockInterviewClient
        interviewId={id}
        initialMessages={messages || []}
        userId={user.id}
      />
    </main>
  );
}
