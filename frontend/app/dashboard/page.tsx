import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Server-side auth check — if not logged in, send to login
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
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

        {/* Placeholder cards for what we'll build */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Readiness Score</p>
            <p className="text-4xl font-bold text-zinc-50">—</p>
            <p className="text-xs text-zinc-600">Upload your resume to get started</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Target Role</p>
            <p className="text-2xl font-bold text-zinc-50">—</p>
            <p className="text-xs text-zinc-600">Not set yet</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Top Priority</p>
            <p className="text-2xl font-bold text-zinc-50">—</p>
            <p className="text-xs text-zinc-600">Complete your profile first</p>
          </div>
        </div>

        {/* Upload prompt */}
        <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-10 text-center space-y-3">
          <p className="text-zinc-300 font-medium">No resume uploaded yet</p>
          <p className="text-zinc-500 text-sm">Upload your resume to generate your personalized interview preparation plan</p>
          <a href="/" className="inline-block mt-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors">
            Upload Resume →
          </a>
        </div>

      </div>
    </main>
  );
}
