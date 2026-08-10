"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

export default function GenerateQuestionsButton({ userId, hasQuestions }: { userId: string, hasQuestions: boolean }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/interview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate questions");
      }

      router.refresh(); // Refresh to see the new questions
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          hasQuestions 
            ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" 
            : "bg-white text-black hover:bg-zinc-200"
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating AI Questions...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {hasQuestions ? "Regenerate Questions" : "Generate Questions"}
          </>
        )}
      </button>
      {error && <p className="text-red-400 text-xs mt-2 max-w-xs text-right">{error}</p>}
    </div>
  );
}
