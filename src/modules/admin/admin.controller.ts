/**
 * Admin Controller
 * Handles admin dashboard operations
 */

import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import { adminService } from "./admin.service";

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/v1/admin/stats
 * @access  Private/Admin
 */
export const getAdminStats = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await adminService.getAdminStats();
    return ApiResponse.success(res, stats, "Admin statistics retrieved successfully");
  }
);

/**
 * @desc    Get system health status
 * @route   GET /api/v1/admin/health
 * @access  Private/Admin
 */
export const getSystemHealth = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const health = await adminService.getSystemHealth();
    return ApiResponse.success(res, health, "System health retrieved successfully");
  }
);

/**
 * @desc    Get activity logs
 * @route   GET /api/v1/admin/activities
 * @access  Private/Admin
 */
export const getActivityLogs = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await adminService.getActivityLogs(limit);
    return ApiResponse.success(res, activities, "Activity logs retrieved successfully");
  }
);
