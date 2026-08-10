import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your target role details help us generate tailored questions and score your resume accurately.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <ProfileForm
            userId={user.id}
            initialData={
              profile
                ? {
                    target_role: profile.target_role,
                    experience_level: profile.experience_level,
                    target_company: profile.target_company,
                    job_description: profile.job_description,
                  }
                : undefined
            }
          />
        </div>
      </div>
    </main>
  );
}
