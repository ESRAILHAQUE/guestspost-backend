/**
 * File Utility
 * Handles file operations for VPS storage
 */

import fs from "fs/promises";
import path from "path";
import { config } from "@/config/env.config";
import { logger } from "./logger";
import { v4 as uuidv4 } from "uuid";

/**
 * Ensure upload directory exists
 */
export const ensureUploadDirectory = async (subdirectory?: string): Promise<string> => {
  const uploadPath = subdirectory 
    ? path.join(config.upload.uploadPath, subdirectory)
    : config.upload.uploadPath;

  try {
    await fs.mkdir(uploadPath, { recursive: true });
    return uploadPath;
  } catch (error) {
    logger.error(`Failed to create upload directory: ${uploadPath}`, error);
    throw new Error(`Failed to create upload directory: ${uploadPath}`);
  }
};

/**
 * Save file to VPS
 */
export const saveFileToVPS = async (
  file: Express.Multer.File,
  subdirectory: string = "site-submissions"
): Promise<{ filePath: string; fileName: string }> => {
  try {
    // Ensure directory exists
    const uploadDir = await ensureUploadDirectory(subdirectory);

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    // Return relative path for database storage
    const relativePath = path.join(subdirectory, uniqueFileName).replace(/\\/g, "/");

    logger.success(`File saved to VPS: ${relativePath}`);
    return {
      filePath: relativePath,
      fileName: file.originalname,
    };
  } catch (error) {
    logger.error("Failed to save file to VPS:", error);
    throw new Error("Failed to save file to VPS");
  }
};

/**
 * Delete file from VPS
 */
export const deleteFileFromVPS = async (filePath: string): Promise<boolean> => {
  try {
    const fullPath = path.join(config.upload.uploadPath, filePath);
    await fs.unlink(fullPath);
    logger.success(`File deleted from VPS: ${filePath}`);
    return true;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      logger.warn(`File not found on VPS: ${filePath}`);
      return true; // File doesn't exist, consider it deleted
    }
    logger.error(`Failed to delete file from VPS: ${filePath}`, error);
    return false;
  }
};

/**
 * Get full file path
 */
export const getFullFilePath = (relativePath: string): string => {
  return path.join(config.upload.uploadPath, relativePath);
};

/**
 * Check if file exists
 */
export const fileExists = async (relativePath: string): Promise<boolean> => {
  try {
    const fullPath = getFullFilePath(relativePath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get file size
 */
export const getFileSize = async (relativePath: string): Promise<number> => {
  try {
    const fullPath = getFullFilePath(relativePath);
    const stats = await fs.stat(fullPath);
    return stats.size;
  } catch (error) {
    logger.error(`Failed to get file size: ${relativePath}`, error);
    return 0;
  }
};

