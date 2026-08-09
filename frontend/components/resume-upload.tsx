"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]?.type === "application/pdf") {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    } else {
      setError("Please upload a PDF file.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Get the currently logged-in user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("You must be logged in to upload a resume.");
        setUploading(false);
        return;
      }

      // 2. Build the file path: userId/timestamp-filename.pdf
      //    This matches our RLS policy: folder name = user's ID
      const timestamp = Date.now();
      const filePath = `${user.id}/${timestamp}-${file.name}`;

      // 3. Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false, // Don't overwrite existing files
        });

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      // 4. Save the resume record to our database
      const { error: dbError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          file_url: filePath,
          parsed_status: "pending",
        });

      if (dbError) {
        setError(`Database error: ${dbError.message}`);
        setUploading(false);
        return;
      }

      // 5. Success! Redirect to dashboard
      router.push("/dashboard");
      router.refresh(); // Force the dashboard to re-fetch data

    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-200 ease-in-out
          ${isDragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-500"}
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {file ? (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-green-500/20 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{file.name}</p>
              <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-zinc-800 rounded-full">
              <UploadCloud className="w-8 h-8 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">Click or drag your resume here</p>
              <p className="text-xs text-zinc-500 mt-1">PDF up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button
        onClick={handleUpload}
        className="w-full mt-4 bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
        disabled={!file || uploading}
        size="lg"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Analyze Resume
          </>
        )}
      </Button>
    </div>
  );
}
