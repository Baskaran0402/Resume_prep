"use client"; // This tells Next.js that this component requires browser interactivity

import { useState } from "react";
import { UploadCloud, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag events to create the visual "highlight" effect
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      // Only accept PDFs for now to keep our MVP simple
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      {/* The Drag and Drop Area */}
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
        
        {/* Conditional Rendering: Show file details if uploaded, else show upload prompt */}
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
              <p className="text-sm font-medium text-zinc-200">
                Click or drag your resume here
              </p>
              <p className="text-xs text-zinc-500 mt-1">PDF up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      {/* The Analyze Button */}
      <Button 
        className="w-full mt-4 bg-white text-black hover:bg-zinc-200 disabled:opacity-50" 
        disabled={!file}
        size="lg"
      >
        <FileText className="w-4 h-4 mr-2" />
        Analyze Resume
      </Button>
    </div>
  );
}
