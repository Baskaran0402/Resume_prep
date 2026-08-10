import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch existing profile data if any
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-50 py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors text-sm mb-6 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
          <p className="text-zinc-400 mt-2">
            Tell us about your target role so we can generate tailored interview questions and score your resume accurately.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <ProfileForm 
            userId={user.id} 
            initialData={profile ? {
              target_role: profile.target_role,
              experience_level: profile.experience_level,
              target_company: profile.target_company
            } : undefined}
          />
        </div>
      </div>
    </main>
  );
}
