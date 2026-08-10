"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";

export default function GenerateQuestionsButton({
  userId,
  hasQuestions,
}: {
  userId: string;
  hasQuestions: boolean;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate questions");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          hasQuestions
            ? "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : hasQuestions ? (
          <>
            <RefreshCw className="w-4 h-4" />
            Regenerate Questions
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Questions
          </>
        )}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
