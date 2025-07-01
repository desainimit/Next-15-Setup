// // utils/uploadHelpers.ts
// import {
//   UploadOptions,
//   ChunkUploadResponse,
//   MergeUploadResponse,
//   UploadResponse,
// } from "@/interfaces";

// const API_BASE_URL = "http://localhost:4012/api/v1/upload";
// const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

// export const FILE_SIZE_LIMITS = {
//   SMALL: 1024 * 1024, // 1MB
//   MEDIUM: 50 * 1024 * 1024, // 50MB
// };

// export const generateFileId = (): string => {
//   return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
// };

// export const formatFileSize = (bytes: number): string => {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const sizes = ["Bytes", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// };

// export const getFileType = (
//   file: File
// ): "image" | "video" | "audio" | "document" | "other" => {
//   const type = file.type.toLowerCase();
//   if (type.startsWith("image/")) return "image";
//   if (type.startsWith("video/")) return "video";
//   if (type.startsWith("audio/")) return "audio";
//   if (
//     type.includes("pdf") ||
//     type.includes("document") ||
//     type.includes("text")
//   )
//     return "document";
//   return "other";
// };

// export const createPreviewUrl = (file: File): string | null => {
//   const fileType = getFileType(file);
//   if (fileType === "image" || fileType === "video") {
//     return URL.createObjectURL(file);
//   }
//   return null;
// };

// // Upload small/medium files directly
// export const uploadDirectFile = async (
//   file: File,
//   options: UploadOptions
// ): Promise<UploadResponse> => {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("mode", options.mode);

//   const xhr = new XMLHttpRequest();

//   return new Promise((resolve, reject) => {
//     xhr.upload.addEventListener("progress", (event) => {
//       if (event.lengthComputable && options.onProgress) {
//         const progress = (event.loaded / event.total) * 100;
//         options.onProgress(progress);
//       }
//     });

//     xhr.addEventListener("load", () => {
//       if (xhr.status === 200) {
//         try {
//           const response = JSON.parse(xhr.responseText);
//           resolve(response);
//         } catch (error: any) {
//           reject(new Error(error.message || "Invalid response format"));
//         }
//       } else {
//         reject(new Error(`Upload failed with status ${xhr.status}`));
//       }
//     });

//     xhr.addEventListener("error", () => {
//       reject(new Error("Network error occurred"));
//     });

//     xhr.open("POST", API_BASE_URL);
//     xhr.send(formData);
//   });
// };

// // Upload large files in chunks
// export const uploadChunkedFile = async (
//   file: File,
//   options: UploadOptions
// ): Promise<UploadResponse> => {
//   const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
//   const fileName = file.name;
//   const fileId = generateFileId();

//   let uploadedChunks = 0;

//   // Upload chunks
//   for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
//     const start = chunkIndex * CHUNK_SIZE;
//     const end = Math.min(start + CHUNK_SIZE, file.size);
//     const chunk = file.slice(start, end);

//     const formData = new FormData();
//     formData.append("chunk", chunk);
//     formData.append("chunkIndex", chunkIndex.toString());
//     formData.append("totalChunks", totalChunks.toString());
//     formData.append("fileName", fileName);
//     formData.append("fileId", fileId);
//     formData.append("mode", options.mode);

//     try {
//       const response = await fetch(`${API_BASE_URL}/chunk`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error(`Chunk upload failed: ${response.status}`);
//       }

//       const result: ChunkUploadResponse = await response.json();
//       uploadedChunks++;

//       if (options.onProgress) {
//         const progress = (uploadedChunks / totalChunks) * 100;
//         options.onProgress(progress);
//       }
//     } catch (error: any) {
//       throw new Error(`Failed to upload chunk ${chunkIndex}: ${error.message}`);
//     }
//   }

//   // Merge chunks
//   const mergeResponse = await fetch(`${API_BASE_URL}/merge`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       fileId,
//       fileName,
//       totalChunks,
//       mode: options.mode,
//     }),
//   });

//   if (!mergeResponse.ok) {
//     throw new Error(`Merge failed: ${mergeResponse.status}`);
//   }

//   const mergeResult: MergeUploadResponse = await mergeResponse.json();

//   return {
//     success: mergeResult.success,
//     fileUrl: mergeResult.fileUrl,
//     fileName: mergeResult.fileName,
//   };
// };

// // Main upload function that chooses the right strategy
// export const uploadFile = async (
//   file: File,
//   options: UploadOptions
// ): Promise<UploadResponse> => {
//   if (file.size <= FILE_SIZE_LIMITS.MEDIUM) {
//     return uploadDirectFile(file, options);
//   } else {
//     return uploadChunkedFile(file, options);
//   }
// };
import axios from "axios";
import {
  UploadOptions,
  ChunkUploadResponse,
  MergeUploadResponse,
  UploadResponse,
} from "@/interfaces";

const API_BASE_URL = "http://localhost:4012/api/v1/upload";
const CHUNK_SIZE = 1024 * 2048; // 2MB chunks

export const FILE_SIZE_LIMITS = {
  SMALL: 1024 * 1024, // 1MB
  MEDIUM: 50 * 1024 * 1024, // 50MB
};

export const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileType = (
  file: File
): "image" | "video" | "audio" | "document" | "other" => {
  const type = file.type.toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (
    type.includes("pdf") ||
    type.includes("document") ||
    type.includes("text")
  )
    return "document";
  return "other";
};

export const createPreviewUrl = (file: File): string | null => {
  const fileType = getFileType(file);
  if (fileType === "image" || fileType === "video") {
    return URL.createObjectURL(file);
  }
  return null;
};

// Upload small/medium files directly using Axios
export const uploadDirectFile = async (
  file: File,
  options: UploadOptions
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", options.mode);

  const response = await axios.post<UploadResponse>(API_BASE_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (options.onProgress && progressEvent.total) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        options.onProgress(progress);
      }
    },
  });

  return response.data;
};

// Upload large files in chunks using Axios
export const uploadChunkedFile = async (
  file: File,
  options: UploadOptions
): Promise<UploadResponse> => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const fileName = file.name;
  const fileId = generateFileId();

  let uploadedChunks = 0;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("totalChunks", totalChunks.toString());
    formData.append("fileName", fileName);
    formData.append("fileId", fileId);
    formData.append("mode", options.mode);

    try {
      const response = await axios.post<ChunkUploadResponse>(
        `${API_BASE_URL}/chunk`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      uploadedChunks++;
      if (options.onProgress) {
        const progress = (uploadedChunks / totalChunks) * 100;
        options.onProgress(progress);
      }
    } catch (error: any) {
      throw new Error(`Failed to upload chunk ${chunkIndex}: ${error.message}`);
    }
  }

  // Merge chunks
  try {
    const mergeResponse = await axios.post<MergeUploadResponse>(
      `${API_BASE_URL}/merge`,
      {
        fileId,
        fileName,
        totalChunks,
        mode: options.mode,
        mimetype: file.type,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const mergeResult = mergeResponse.data;

    return mergeResult;
  } catch (error: any) {
    throw new Error(`Merge failed: ${error.message}`);
  }
};

// Smart upload: small = direct, large = chunked
export const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<UploadResponse> => {
  if (file.size <= FILE_SIZE_LIMITS.MEDIUM) {
    return uploadDirectFile(file, options);
  } else {
    return uploadChunkedFile(file, options);
  }
};
