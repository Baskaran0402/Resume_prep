"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";

export default function GenerateAnalysisButton({ userId, hasAnalysis }: { userId: string, hasAnalysis: boolean }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analysis/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate analysis");
      }

      router.refresh(); 
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          hasAnalysis 
            ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm" 
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20"
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Running AI Gap Analysis...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            {hasAnalysis ? "Regenerate Analysis" : "Generate Gap Analysis & Readiness Score"}
          </>
        )}
      </button>
      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
