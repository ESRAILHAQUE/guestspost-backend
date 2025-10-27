import { Request, Response, NextFunction } from "express";
import {
  siteSubmissionService,
  CreateSiteSubmissionDto,
  UpdateSiteSubmissionDto,
  SiteSubmissionFilters,
} from "./siteSubmission.service";
import { asyncHandler } from "@/middlewares";
import { ApiResponse } from "@/utils/apiResponse";

export const createSiteSubmission = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const siteSubmissionData: CreateSiteSubmissionDto = req.body;
    const siteSubmission = await siteSubmissionService.createSiteSubmission(
      siteSubmissionData
    );
    ApiResponse.created(
      res,
      siteSubmission,
      "Site submission created successfully"
    );
  }
);

export const getSiteSubmissions = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters: SiteSubmissionFilters = req.query;

    // If user is not admin, they can only see their own submissions
    if (req.user && req.user.role !== "admin") {
      // Get user's email from the user in request
      const User = (await import("@/modules/user/user.model")).User;
      const user = await User.findById(req.user.userId);
      if (user) {
        filters.userEmail = user.user_email;
      }
    }

    const result = await siteSubmissionService.getSiteSubmissions(filters);
    ApiResponse.success(
      res,
      result.siteSubmissions,
      "Site submissions retrieved successfully"
    );
  }
);

export const getSiteSubmissionById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const siteSubmission = await siteSubmissionService.getSiteSubmissionById(
      id
    );
    ApiResponse.success(
      res,
      siteSubmission,
      "Site submission retrieved successfully"
    );
  }
);

export const updateSiteSubmission = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updateData: UpdateSiteSubmissionDto = req.body;
    const siteSubmission = await siteSubmissionService.updateSiteSubmission(
      id,
      updateData
    );
    ApiResponse.success(
      res,
      siteSubmission,
      "Site submission updated successfully"
    );
  }
);

export const deleteSiteSubmission = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await siteSubmissionService.deleteSiteSubmission(id);
    ApiResponse.noContent(res);
  }
);

export const getSiteSubmissionStats = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters: SiteSubmissionFilters = req.query;

    // If user is not admin, they can only see their own stats
    if (req.user && req.user.role !== "admin") {
      // Get user's email from the user in request
      const User = (await import("@/modules/user/user.model")).User;
      const user = await User.findById(req.user.userId);
      if (user) {
        filters.userEmail = user.user_email;
      }
    }

    const stats = await siteSubmissionService.getSiteSubmissionStats(filters);
    ApiResponse.success(
      res,
      stats,
      "Site submission statistics retrieved successfully"
    );
  }
);

export const getSiteSubmissionsByUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userEmail } = req.params;
    const filters: SiteSubmissionFilters = req.query;
    const siteSubmissions =
      await siteSubmissionService.getSiteSubmissionsByUser(userEmail, filters);
    ApiResponse.success(
      res,
      siteSubmissions,
      "User site submissions retrieved successfully"
    );
  }
);
// Enhanced site submission controller
