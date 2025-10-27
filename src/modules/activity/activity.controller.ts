import { Request, Response, NextFunction } from "express";
import { activityService } from "./activity.service";
import { asyncHandler } from "@/middlewares";
import { ApiResponse } from "@/utils/apiResponse";

export const getActivities = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const activities = await activityService.getAllActivities(limit);
    ApiResponse.success(res, activities, "Activities retrieved successfully");
  }
);

export const getActivitiesByType = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { type } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const activities = await activityService.getActivitiesByType(type, limit);
    ApiResponse.success(res, activities, "Activities retrieved successfully");
  }
);

export const getActivitiesByUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const activities = await activityService.getActivitiesByUser(userId, limit);
    ApiResponse.success(res, activities, "Activities retrieved successfully");
  }
);

export const getActivityStats = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await activityService.getActivityStats();
    ApiResponse.success(
      res,
      stats,
      "Activity statistics retrieved successfully"
    );
  }
);
// Enhanced error handling
