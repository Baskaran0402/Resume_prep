"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProfileForm({
  userId,
  initialData,
}: {
  userId: string;
  initialData?: {
    target_role: string;
    experience_level: string;
    target_company: string;
    job_description: string;
  };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [targetRole, setTargetRole] = useState(initialData?.target_role || "");
  const [experienceLevel, setExperienceLevel] = useState(
    initialData?.experience_level || "Junior"
  );
  const [targetCompany, setTargetCompany] = useState(
    initialData?.target_company || ""
  );
  const [jobDescription, setJobDescription] = useState(
    initialData?.job_description || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          target_role: targetRole,
          experience_level: experienceLevel,
          target_company: targetCompany,
          job_description: jobDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors";
  const labelClass = "text-xs font-medium text-muted-foreground";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className={labelClass}>Target Role</label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Senior Frontend Engineer"
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Experience Level</label>
        <select
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          className={`${inputClass} appearance-none`}
        >
          <option value="Intern">Intern</option>
          <option value="Junior">Junior / Entry Level</option>
          <option value="Mid-Level">Mid-Level</option>
          <option value="Senior">Senior</option>
          <option value="Lead">Lead / Manager</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Target Company <span className="text-muted-foreground/60">(optional)</span></label>
        <input
          type="text"
          value={targetCompany}
          onChange={(e) => setTargetCompany(e.target.value)}
          placeholder="e.g. Google, Stripe, or Startups"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Job Description <span className="text-muted-foreground/60">(optional)</span></label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={5}
          className={`${inputClass} resize-y`}
        />
        <p className="text-xs text-muted-foreground">
          Pasting a JD allows the AI to perfectly align your gap analysis to the role.
        </p>
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
