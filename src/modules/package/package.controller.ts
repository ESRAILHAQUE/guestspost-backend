/**
 * Package Controller
 * Handles HTTP requests for package management
 */

import { Request, Response, NextFunction } from "express";
import { packageService } from "./package.service";
import { CreatePackageDto, UpdatePackageDto } from "./package.dto";
import { asyncHandler } from "@/middlewares";
import { ApiResponse } from "@/utils/apiResponse";

/**
 * Create a new package
 */
export const createPackage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const packageData: CreatePackageDto = req.body;
    const newPackage = await packageService.createPackage(packageData);
    ApiResponse.created(res, newPackage, "Package created successfully");
  }
);

/**
 * Get all packages
 */
export const getPackages = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const status = req.query.status as string;
    let packages;

    if (status === "active") {
      packages = await packageService.getActivePackages();
    } else {
      packages = await packageService.getAllPackages();
    }

    ApiResponse.success(res, packages, "Packages retrieved successfully");
  }
);

/**
 * Get package by ID
 */
export const getPackageById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const packageItem = await packageService.getPackageById(id);
    ApiResponse.success(res, packageItem, "Package retrieved successfully");
  }
);

/**
 * Update package
 */
export const updatePackage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updateData: UpdatePackageDto = req.body;
    const updatedPackage = await packageService.updatePackage(id, updateData);
    ApiResponse.success(res, updatedPackage, "Package updated successfully");
  }
);

/**
 * Delete package
 */
export const deletePackage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await packageService.deletePackage(id);
    ApiResponse.success(res, null, "Package deleted successfully");
  }
);

/**
 * Get package statistics
 */
export const getPackageStats = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await packageService.getPackageStats();
    ApiResponse.success(
      res,
      stats,
      "Package statistics retrieved successfully"
    );
  }
);
