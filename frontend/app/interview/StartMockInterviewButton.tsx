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
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
    >
      {isStarting ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Starting Session...
        </>
      ) : (
        <>
          <Play className="w-5 h-5 fill-current" />
          Start New Mock Interview
        </>
      )}
    </button>
  );
}
