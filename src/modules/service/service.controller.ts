import { Request, Response } from "express";
import ServiceService from "./service.service";
import { ApiResponse } from "@/utils/apiResponse";
import { logger } from "@/utils/logger";

/**
 * Create a new service
 */
export const createService = async (req: Request, res: Response) => {
  try {
    const service = await ServiceService.createService(req.body);

    ApiResponse.success(res, service, "Service created successfully", 201);
  } catch (error: any) {
    logger.error("Error in createService:", error);
    ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

/**
 * Get all services
 */
export const getServices = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as "active" | "inactive" | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await ServiceService.getServices(filters);

    ApiResponse.success(res, result.services, "Services fetched successfully");
  } catch (error: any) {
    logger.error("Error in getServices:", error);
    ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

/**
 * Get active services (public access)
 */
export const getActiveServices = async (_req: Request, res: Response) => {
  try {
    const services = await ServiceService.getActiveServices();

    ApiResponse.success(res, services, "Active services fetched successfully");
  } catch (error: any) {
    logger.error("Error in getActiveServices:", error);
    ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

/**
 * Get service by ID
 */
export const getService = async (req: Request, res: Response) => {
  try {
    const service = await ServiceService.getServiceById(req.params.id);

    ApiResponse.success(res, service, "Service fetched successfully");
  } catch (error: any) {
    logger.error("Error in getService:", error);
    ApiResponse.error(res, error.message, error.statusCode || 404);
  }
};

/**
 * Update service
 */
export const updateService = async (req: Request, res: Response) => {
  try {
    const service = await ServiceService.updateService(req.params.id, req.body);

    ApiResponse.success(res, service, "Service updated successfully");
  } catch (error: any) {
    logger.error("Error in updateService:", error);
    ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

/**
 * Delete service
 */
export const deleteService = async (req: Request, res: Response) => {
  try {
    await ServiceService.deleteService(req.params.id);

    ApiResponse.success(res, null, "Service deleted successfully");
  } catch (error: any) {
    logger.error("Error in deleteService:", error);
    ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

