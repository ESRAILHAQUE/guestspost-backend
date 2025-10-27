/**
 * Website Controller
 * Handles HTTP requests for website management
 */

import { Request, Response, NextFunction } from "express";
import {
  websiteService,
  CreateWebsiteDto,
  UpdateWebsiteDto,
  WebsiteFilters,
} from "./website.service";
import { asyncHandler } from "@/middlewares";
import { ApiResponse } from "@/utils/apiResponse";

/**
 * Create a new website
 */
export const createWebsite = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const websiteData: CreateWebsiteDto = req.body;

    const website = await websiteService.createWebsite(websiteData);

    ApiResponse.created(res, website, "Website created successfully");
  }
);

/**
 * Get all websites with filters
 */
export const getWebsites = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters: WebsiteFilters = {
      status: req.query.status as string,
      category: req.query.category as string,
      niche: req.query.niche as string,
      section: req.query.section as string,
      minDa: req.query.minDa ? Number(req.query.minDa) : undefined,
      maxDa: req.query.maxDa ? Number(req.query.maxDa) : undefined,
      minDr: req.query.minDr ? Number(req.query.minDr) : undefined,
      maxDr: req.query.maxDr ? Number(req.query.maxDr) : undefined,
      search: req.query.search as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const result = await websiteService.getWebsites(filters);

    ApiResponse.paginated(
      res,
      result.websites,
      result.page,
      result.limit,
      result.total,
      "Websites retrieved successfully"
    );
  }
);

/**
 * Get website by ID
 */
export const getWebsiteById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const website = await websiteService.getWebsiteById(id);

    ApiResponse.success(res, website, "Website retrieved successfully");
  }
);

/**
 * Update website
 */
export const updateWebsite = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updateData: UpdateWebsiteDto = req.body;

    const website = await websiteService.updateWebsite(id, updateData);

    ApiResponse.success(res, website, "Website updated successfully");
  }
);

/**
 * Delete website
 */
export const deleteWebsite = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    await websiteService.deleteWebsite(id);

    ApiResponse.success(res, null, "Website deleted successfully");
  }
);

/**
 * Get website statistics
 */
export const getWebsiteStats = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await websiteService.getWebsiteStats();

    ApiResponse.success(
      res,
      stats,
      "Website statistics retrieved successfully"
    );
  }
);

/**
 * Get categories
 */
export const getCategories = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const categories = await websiteService.getCategories();

    ApiResponse.success(res, categories, "Categories retrieved successfully");
  }
);

/**
 * Get niches
 */
export const getNiches = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const niches = await websiteService.getNiches();

    ApiResponse.success(res, niches, "Niches retrieved successfully");
  }
);
