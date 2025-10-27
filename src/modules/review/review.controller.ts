import { Request, Response, NextFunction } from "express";
import { reviewService } from "./review.service";
import { CreateReviewDto, UpdateReviewDto } from "./review.dto";
import { asyncHandler } from "@/middlewares";
import { ApiResponse } from "@/utils/apiResponse";

export const createReview = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const reviewData: CreateReviewDto = req.body;
    const newReview = await reviewService.createReview(reviewData);
    ApiResponse.created(res, newReview, "Review created successfully");
  }
);

export const getReviews = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const reviews = await reviewService.getAllReviews();
    ApiResponse.success(res, reviews, "Reviews retrieved successfully");
  }
);

export const getReviewById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const review = await reviewService.getReviewById(id);
    ApiResponse.success(res, review, "Review retrieved successfully");
  }
);

export const updateReview = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updateData: UpdateReviewDto = req.body;
    const updatedReview = await reviewService.updateReview(id, updateData);
    ApiResponse.success(res, updatedReview, "Review updated successfully");
  }
);

export const deleteReview = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await reviewService.deleteReview(id);
    ApiResponse.success(res, null, "Review deleted successfully");
  }
);

export const getReviewStats = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await reviewService.getReviewStats();
    ApiResponse.success(res, stats, "Review statistics retrieved successfully");
  }
);
