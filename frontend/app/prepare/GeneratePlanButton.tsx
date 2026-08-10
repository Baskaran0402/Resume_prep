"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, RefreshCw } from "lucide-react";

export default function GeneratePlanButton({ userId, hasPlan }: { userId: string, hasPlan: boolean }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/prepare/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) throw new Error("Failed to generate study plan");
      
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to generate plan. Ensure you have completed your profile and gap analysis.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {isGenerating ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Building Plan...
        </>
      ) : (
        <>
          <BookOpen className="w-4 h-4" />
          {hasPlan ? "Regenerate Study Plan" : "Generate Study Plan"}
        </>
      )}
    </button>
  );
}
