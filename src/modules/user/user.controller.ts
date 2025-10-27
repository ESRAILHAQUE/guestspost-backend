/**
 * User Controller
 * Handles user-related operations
 */

import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import { userService } from "./user.service";

/**
 * @desc    Get current user
 * @route   GET /api/v1/users/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.getUserById(req.user!.userId);
    return ApiResponse.success(
      res,
      user,
      "Current user retrieved successfully"
    );
  }
);

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const users = await userService.getAllUsers();
    return ApiResponse.success(res, users, "Users retrieved successfully");
  }
);

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
export const getUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.getUserById(req.params.id);
    return ApiResponse.success(res, user, "User retrieved successfully");
  }
);

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private
 */
export const updateUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await userService.updateUser(req.params.id, req.body);
    return ApiResponse.success(res, user, "User updated successfully");
  }
);

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    await userService.deleteUser(req.params.id);
    return ApiResponse.success(res, null, "User deleted successfully");
  }
);
// Enhanced user controller
