"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";

export default function StartMockInterviewButton({ userId }: { userId: string }) {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/mock/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) throw new Error("Failed to start mock interview");

      const data = await response.json();
      router.push(`/interview/${data.interview_id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start interview. Make sure your profile and resume are complete.");
      setIsStarting(false);
    }
  };

  return (
    <button
      onClick={handleStart}
      disabled={isStarting}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 flex-shrink-0"
    >
      {isStarting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Starting...
        </>
      ) : (
        <>
          <Play className="w-4 h-4 fill-current" />
          Start Mock Interview
        </>
      )}
    </button>
  );
}
