import { Request, Response, NextFunction } from "express";
import {
  siteSubmissionService,
  CreateSiteSubmissionDto,
  UpdateSiteSubmissionDto,
  SiteSubmissionFilters,
} from "./siteSubmission.service";
import { asyncHandler } from "@/middlewares";
import { ApiResponse } from "@/utils/apiResponse";
import { saveFileToVPS } from "@/utils/file.utils";

export const createSiteSubmission = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    // Debug: Log received data
    console.log("Received body:", req.body);
    console.log("Received file:", req.file);
    
    // Parse FormData fields
    const siteSubmissionData: CreateSiteSubmissionDto = {
      userId: req.body.userId || req.body.user_id || undefined,
      userName: req.body.userName || req.body.name || req.body.publisherName || "Guest User",
      userEmail: req.body.userEmail || req.body.email,
      websites: typeof req.body.websites === "string" 
        ? JSON.parse(req.body.websites) 
        : req.body.websites || (req.body.website ? [req.body.website] : []),
      isOwner: req.body.isOwner === "true" || req.body.isOwner === true || req.body.websiteOwner === "yes",
      publisherName: req.body.publisherName,
      country: req.body.country,
      phone: req.body.phone,
      message: req.body.message,
      siteDescription: req.body.siteDescription,
      monthlyTraffic: req.body.monthlyTraffic || req.body.monthly_traffic,
      domainAuthority: req.body.domainAuthority || req.body.domain_authority,
      domainRating: req.body.domainRating || req.body.domain_rating,
      websiteOwner: req.body.websiteOwner,
    };

    // Handle file upload if present
    if (req.file) {
      try {
        const fileInfo = await saveFileToVPS(req.file, "site-submissions");
        siteSubmissionData.csvFile = {
          fileName: fileInfo.fileName,
          filePath: fileInfo.filePath,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        };
      } catch (error: any) {
        ApiResponse.badRequest(res, `File upload failed: ${error.message}`);
        return;
      }
    }

    const siteSubmission = await siteSubmissionService.createSiteSubmission(
      siteSubmissionData
    );
    ApiResponse.created(
      res,
      siteSubmission,
      "Site submission created successfully"
    );
    return;
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
