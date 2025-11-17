import { Request, Response } from "express";
import ServicePackageService from "./servicePackage.service";
import { ApiResponse } from "@/utils/apiResponse";
import { logger } from "@/utils/logger";

/**
 * Create a new service package
 */
export const createServicePackage = async (req: Request, res: Response) => {
  try {
    const servicePackage = await ServicePackageService.createServicePackage(
      req.body
    );

    ApiResponse.success(
      res,
      servicePackage,
      "Service package created successfully",
      201
    );
  } catch (error: any) {
    logger.error("Error in createServicePackage:", error);
    ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

/**
 * Get all service packages
 */
export const getServicePackages = async (req: Request, res: Response) => {
  try {
    const filters = {
      serviceId: req.query.serviceId as string | undefined,
      status: req.query.status as "active" | "inactive" | undefined,
      popular: req.query.popular === "true" ? true : undefined,
    };

    const result = await ServicePackageService.getServicePackages(filters);

    ApiResponse.success(
      res,
      result.packages,
      "Service packages fetched successfully"
    );
  } catch (error: any) {
    logger.error("Error in getServicePackages:", error);
    ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

/**
 * Get active service packages grouped by serviceId (public access)
 */
export const getActiveServicePackagesGrouped = async (
  _req: Request,
  res: Response
) => {
  try {
    const grouped =
      await ServicePackageService.getActiveServicePackagesGrouped();

    ApiResponse.success(
      res,
      grouped,
      "Active service packages fetched successfully"
    );
  } catch (error: any) {
    logger.error("Error in getActiveServicePackagesGrouped:", error);
    ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

/**
 * Get service package by ID
 */
export const getServicePackage = async (req: Request, res: Response) => {
  try {
    const servicePackage = await ServicePackageService.getServicePackageById(
      req.params.id
    );

    ApiResponse.success(
      res,
      servicePackage,
      "Service package fetched successfully"
    );
  } catch (error: any) {
    logger.error("Error in getServicePackage:", error);
    ApiResponse.error(res, error.message, error.statusCode || 404);
  }
};

/**
 * Update service package
 */
export const updateServicePackage = async (req: Request, res: Response) => {
  try {
    const servicePackage = await ServicePackageService.updateServicePackage(
      req.params.id,
      req.body
    );

    ApiResponse.success(
      res,
      servicePackage,
      "Service package updated successfully"
    );
  } catch (error: any) {
    logger.error("Error in updateServicePackage:", error);
    ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

/**
 * Delete service package
 */
export const deleteServicePackage = async (req: Request, res: Response) => {
  try {
    await ServicePackageService.deleteServicePackage(req.params.id);

    ApiResponse.success(res, null, "Service package deleted successfully");
  } catch (error: any) {
    logger.error("Error in deleteServicePackage:", error);
    ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};


