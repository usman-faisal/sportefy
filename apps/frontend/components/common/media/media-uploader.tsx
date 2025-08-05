"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Your Supabase browser client
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  File as FileIcon,
} from "lucide-react";
import Image from "next/image";
import { MediaEntityType } from "@/lib/types";

interface MediaUploaderProps {
  initialUrl?: string;
  mediaEntityType: MediaEntityType;
  onUploadComplete: (url: string, type: string) => void;
}

const getBucketName = (mediaEntityType: MediaEntityType) => {
  switch (mediaEntityType) {
    case MediaEntityType.FACILITY:
      return "facilities";
    default:
      throw new Error("Invalid media entity type");
  }
};

export function MediaUploader({
  initialUrl = "",
  mediaEntityType,
  onUploadComplete,
}: MediaUploaderProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>(initialUrl);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(0);
    setUploadedUrl("");

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${getBucketName(mediaEntityType)}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("sportefy")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          duplex: "half",
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("sportefy")
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error("Could not get public URL for the uploaded file.");
      }

      const finalUrl = urlData.publicUrl;
      setUploadedUrl(finalUrl);
      onUploadComplete(finalUrl, file.type.split("/")[0] || "image"); // e.g., 'image' from 'image/png'
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
      setProgress(100);
    }
  };

  return (
    <div className="w-full p-4 border-2 border-dashed rounded-lg">
      {uploadedUrl ? (
        <div className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
          <p className="mt-2 text-sm font-semibold">Upload Complete</p>
          <div className="relative w-32 h-32 mx-auto mt-2 overflow-hidden rounded-md">
            <Image
              src={uploadedUrl}
              alt="Uploaded media"
              fill
              className="object-cover"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 truncate">{uploadedUrl}</p>
        </div>
      ) : uploading ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-sm">Uploading...</p>
          <Progress value={progress} className="w-full" />
          <p className="text-xs">{progress}%</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          <AlertCircle className="w-12 h-12 mx-auto" />
          <p className="mt-2 text-sm font-semibold">Upload Failed</p>
          <p className="mt-1 text-xs">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            Try Again
          </Button>
          <Input
            id="file-input"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/*"
          />
        </div>
      ) : (
        <div className="text-center">
          <label htmlFor="file-input" className="cursor-pointer">
            <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </label>
          <Input
            id="file-input"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/*"
          />
        </div>
      )}
    </div>
  );
}
