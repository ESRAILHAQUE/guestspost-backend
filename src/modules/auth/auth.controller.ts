/**
 * Authentication Controller
 * Handles user authentication - login, register, logout
 */

import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import { authService } from "./auth.service";

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.register(req.body);
    
    // Set cookie
    res.cookie("token", result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ApiResponse.created(res, result, "User registered successfully");
  }
);

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.login(req.body);
    
    // Set cookie
    res.cookie("token", result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ApiResponse.success(res, result, "Login successful");
  }
);

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    // Clear cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return ApiResponse.success(res, null, "Logout successful");
  }
);

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await authService.getMe(req.user?.userId as string);
    return ApiResponse.success(res, user, "User retrieved successfully");
  }
);

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.forgotPassword(req.body);
    return ApiResponse.success(res, result, "Password reset email sent");
  }
);

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.resetPassword(req.body);
    return ApiResponse.success(res, result, "Password reset successful");
  }
);

/**
 * @desc    Change password
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.changePassword(
      req.user?.userId as string,
      req.body
    );
    return ApiResponse.success(res, result, "Password changed successfully");
  }
);

/**
 * @desc    Refresh token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    
    // Set new cookie
    res.cookie("token", result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ApiResponse.success(res, result, "Token refreshed successfully");
  }
);

