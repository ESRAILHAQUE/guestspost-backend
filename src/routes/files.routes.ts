/**
 * File Routes
 * Handles file serving from VPS
 */

import { Router } from "express";
import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { config } from "@/config/env.config";
import { protect } from "@/middlewares";
import { ApiResponse } from "@/utils/apiResponse";

const router = Router();

/**
 * Serve file from VPS
 * GET /api/v1/files/:filePath
 */
router.get("/:filePath(*)", protect, async (req: Request, res: Response) => {
  try {
    const { filePath } = req.params;
    
    // Security: Prevent directory traversal
    if (filePath.includes("..") || path.isAbsolute(filePath)) {
      return ApiResponse.badRequest(res, "Invalid file path");
    }

    const fullPath = path.join(config.upload.uploadPath, filePath);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return ApiResponse.notFound(res, "File not found");
    }

    // Get file stats
    const stats = await fs.stat(fullPath);
    if (!stats.isFile()) {
      return ApiResponse.badRequest(res, "Path is not a file");
    }

    // Determine content type
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".csv": "text/csv",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".txt": "text/plain",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
    };

    const contentType = contentTypes[ext] || "application/octet-stream";

    // Set headers
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${path.basename(fullPath)}"`
    );

    // Stream file
    const fileBuffer = await fs.readFile(fullPath);
    return res.send(fileBuffer);
  } catch (error: any) {
    console.error("Error serving file:", error);
    return ApiResponse.internalError(res, "Failed to serve file");
  }
});

export { router as fileRoutes };

