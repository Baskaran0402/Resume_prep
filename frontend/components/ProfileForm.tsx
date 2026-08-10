"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm({ 
  userId, 
  initialData 
}: { 
  userId: string,
  initialData?: { target_role: string, experience_level: string, target_company: string } 
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [targetRole, setTargetRole] = useState(initialData?.target_role || "");
  const [experienceLevel, setExperienceLevel] = useState(initialData?.experience_level || "Junior");
  const [targetCompany, setTargetCompany] = useState(initialData?.target_company || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: userId,
          target_role: targetRole,
          experience_level: experienceLevel,
          target_company: targetCompany
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Success, redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Target Role</label>
        <input 
          type="text" 
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Senior Frontend Engineer"
          required
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-50 focus:outline-none focus:border-white transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Experience Level</label>
        <select 
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-50 focus:outline-none focus:border-white transition-colors appearance-none"
        >
          <option value="Intern">Intern</option>
          <option value="Junior">Junior / Entry Level</option>
          <option value="Mid-Level">Mid-Level</option>
          <option value="Senior">Senior</option>
          <option value="Lead">Lead / Manager</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Target Company (Optional)</label>
        <input 
          type="text" 
          value={targetCompany}
          onChange={(e) => setTargetCompany(e.target.value)}
          placeholder="e.g. Google, Stripe, or Startups"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-50 focus:outline-none focus:border-white transition-colors"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-white text-black font-medium rounded-lg px-4 py-3 hover:bg-zinc-200 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Save Profile & Continue"}
      </button>
    </form>
  );
}
