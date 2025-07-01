export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  downloadUrl?: string;
  previewUrl?: string;
}

export interface ChunkUploadResponse {
  chunkId: string;
  totalChunks: number;
  uploadedChunks: number;
}

export interface MergeUploadResponse {
  status: boolean;
  data: {
    uploadedPath: string;
  };
  message: string;
}

export interface UploadResponse {
  status: boolean;
  data: {
    uploadedPath: string;
  };
  message: string;
}

export type UploadMode = "public" | "private";

export interface UploadOptions {
  mode: UploadMode;
  onProgress?: (progress: number) => void;
}
