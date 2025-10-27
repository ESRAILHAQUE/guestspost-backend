/**
 * FundRequest Controller
 * Handles HTTP requests for fund request management
 */

import { Request, Response, NextFunction } from "express";
import {
  fundRequestService,
  CreateFundRequestDto,
  UpdateFundRequestDto,
  FundRequestFilters,
} from "./fundRequest.service";
import { asyncHandler } from "@/middlewares";
import { ApiResponse } from "@/utils/apiResponse";

/**
 * Create a new fund request
 */
export const createFundRequest = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const fundRequestData: CreateFundRequestDto = req.body;

    const fundRequest = await fundRequestService.createFundRequest(
      fundRequestData
    );

    ApiResponse.created(res, fundRequest, "Fund request created successfully");
  }
);

/**
 * Get all fund requests with filters
 */
export const getFundRequests = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters: FundRequestFilters = {
      userId: req.query.userId as string,
      userEmail: req.query.userEmail as string,
      status: req.query.status as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
    };

    const result = await fundRequestService.getFundRequests(filters);

    ApiResponse.paginated(
      res,
      result.fundRequests,
      result.page,
      result.limit,
      result.total,
      "Fund requests retrieved successfully"
    );
  }
);

/**
 * Get fund request by ID
 */
export const getFundRequestById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const fundRequest = await fundRequestService.getFundRequestById(id);

    ApiResponse.success(
      res,
      fundRequest,
      "Fund request retrieved successfully"
    );
  }
);

/**
 * Update fund request
 */
export const updateFundRequest = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updateData: UpdateFundRequestDto = req.body;

    const fundRequest = await fundRequestService.updateFundRequest(
      id,
      updateData
    );

    ApiResponse.success(res, fundRequest, "Fund request updated successfully");
  }
);

/**
 * Delete fund request
 */
export const deleteFundRequest = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    await fundRequestService.deleteFundRequest(id);

    ApiResponse.success(res, null, "Fund request deleted successfully");
  }
);

/**
 * Approve fund request
 */
export const approveFundRequest = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { processedBy } = req.body;

    const fundRequest = await fundRequestService.approveFundRequest(
      id,
      processedBy
    );

    ApiResponse.success(res, fundRequest, "Fund request approved successfully");
  }
);

/**
 * Reject fund request
 */
export const rejectFundRequest = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { adminNotes, processedBy } = req.body;

    const fundRequest = await fundRequestService.rejectFundRequest(
      id,
      adminNotes,
      processedBy
    );

    ApiResponse.success(res, fundRequest, "Fund request rejected successfully");
  }
);

/**
 * Get fund request statistics
 */
export const getFundRequestStats = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.query.userId as string;

    const stats = await fundRequestService.getFundRequestStats(userId);

    ApiResponse.success(
      res,
      stats,
      "Fund request statistics retrieved successfully"
    );
  }
);

/**
 * Get fund requests by user
 */
export const getFundRequestsByUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userEmail } = req.params;
    const filters = {
      status: req.query.status as string,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
    };

    const fundRequests = await fundRequestService.getFundRequestsByUser(
      userEmail,
      filters
    );

    ApiResponse.success(
      res,
      fundRequests,
      "User fund requests retrieved successfully"
    );
  }
);
