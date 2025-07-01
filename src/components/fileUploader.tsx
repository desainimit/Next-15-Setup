"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadFile } from "@/utils";
import { UploadOptions } from "@/interfaces";

interface FileUploaderProps {
  mode?: "public" | "private";
}

const FileUploader: React.FC = ({ mode = "public" }: FileUploaderProps) => {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadProgress(0);
    setUploadResult(null);
    setError(null);

    const options: UploadOptions = {
      mode, // or 'private'
      onProgress: (progress: number) => {
        setUploadProgress(progress);
      },
    };

    try {
      const result = await uploadFile(file, options);
      console.log("Upload result:", result);
      
      setUploadResult(result.data.uploadedPath || "Upload succeeded");
    } catch (err: any) {
      setError(err.message || "Upload failed");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  return (
    <div className="p-4 border-2 border-dashed border-gray-400 rounded-xl text-center">
      <div {...getRootProps()} className="cursor-pointer py-10">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <p>Drag & drop a file here, or click to select one</p>
        )}
      </div>

      {uploadProgress !== null && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 h-4 rounded">
            <div
              className="h-4 bg-blue-500 rounded"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm mt-1">{uploadProgress.toFixed(1)}%</p>
        </div>
      )}

      {uploadResult && (
        <div className="mt-4 text-green-600">
          ✅ Upload successful!{" "}
          <a
            href={uploadResult}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View File
          </a>
        </div>
      )}

      {error && <div className="mt-4 text-red-600">❌ {error}</div>}
    </div>
  );
};

export default FileUploader;
