"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ResumeUpload({ userId }: { userId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessData(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);

    try {
      const response = await fetch("http://127.0.0.1:8000/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload resume. Please try again.");
      }

      const data = await response.json();
      console.log("Resume parsed successfully:", data);
      setSuccessData(data);
      router.refresh(); // Refresh the page to show the new data!
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
      // Reset input so they can upload again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="inline-block mt-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? "Uploading & Analyzing..." : "Upload Resume →"}
      </button>

      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}

      {successData && (
        <div className="text-green-400 text-sm mt-2 text-center">
          <p>Resume successfully parsed!</p>
          <p className="text-zinc-500 text-xs mt-1">Check your browser console (F12) for the extracted data.</p>
        </div>
      )}
    </div>
  );
}
