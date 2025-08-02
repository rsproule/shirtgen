"use client";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";

interface FileUploadDemoProps {
  onImageUpload?: (file: File | null) => void;
}

export default function FileUploadDemo({ onImageUpload }: FileUploadDemoProps) {
  const [files, setFiles] = useState<File[]>([]);
  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
    // Pass the first uploaded image to parent component
    onImageUpload?.(files.length > 0 ? files[0] : null);
  };

  return (
    <div className="w-64 min-h-32 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
      <FileUpload onChange={handleFileUpload} />
    </div>
  );
} 