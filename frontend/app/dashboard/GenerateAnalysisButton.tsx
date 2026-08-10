"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, RefreshCw } from "lucide-react";

export default function GenerateAnalysisButton({
  userId,
  hasAnalysis,
}: {
  userId: string;
  hasAnalysis: boolean;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analysis/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate analysis");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          hasAnalysis
            ? "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : hasAnalysis ? (
          <>
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Generate Gap Analysis
          </>
        )}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
