/**
 * Upload Middleware
 * Handles file uploads using multer
 */

import multer from "multer";
import { config } from "@/config/env.config";
import { Request } from "express";

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter for allowed file types
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow CSV, PDF, DOC, DOCX, TXT, images
  const allowedMimes = [
    "text/csv",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: CSV, PDF, DOC, DOCX, TXT, Images`));
  }
};

// Configure multer
export const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize, // 5MB default
  },
  fileFilter,
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string = "file") => {
  return upload.single(fieldName);
};

// Middleware for multiple files upload
export const uploadMultiple = (fieldName: string = "files", maxCount: number = 10) => {
  return upload.array(fieldName, maxCount);
};

// Middleware for CSV file upload (site submissions)
export const uploadCSV = uploadSingle("csvFile");

