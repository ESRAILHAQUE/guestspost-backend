import { ServicePackage, IServicePackage } from "./servicePackage.model";
import { AppError } from "@/utils/AppError";
import { logger } from "@/utils/logger";

export interface CreateServicePackageDto {
  serviceId: string;
  name: string;
  price: number;
  originalPrice: number;
  articles: string;
  features: string[];
  popular?: boolean;
  description: string;
  status?: "active" | "inactive";
  order?: number;
}

export interface UpdateServicePackageDto {
  serviceId?: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  articles?: string;
  features?: string[];
  popular?: boolean;
  description?: string;
  status?: "active" | "inactive";
  order?: number;
}

export interface ServicePackageFilters {
  serviceId?: string;
  status?: "active" | "inactive";
  popular?: boolean;
}

class ServicePackageService {
  /**
   * Create a new service package
   */
  async createServicePackage(
    data: CreateServicePackageDto
  ): Promise<IServicePackage> {
    try {
      const servicePackage = new ServicePackage(data);
      await servicePackage.save();

      logger.success(`Service package created: ${servicePackage.name}`);
      return servicePackage;
    } catch (error: any) {
      logger.error("Error creating service package:", error);
      throw new AppError(error.message || "Failed to create service package", 500);
    }
  }

  /**
   * Get all service packages with filters
   */
  async getServicePackages(filters: ServicePackageFilters = {}): Promise<{
    packages: IServicePackage[];
    total: number;
  }> {
    try {
      const { serviceId, status, popular } = filters;

      const query: any = {};

      if (serviceId) {
        query.serviceId = serviceId;
      }

      if (status) {
        query.status = status;
      }

      if (popular !== undefined) {
        query.popular = popular;
      }

      const packages = await ServicePackage.find(query).sort({
        serviceId: 1,
        order: 1,
        createdAt: -1,
      });
      const total = await ServicePackage.countDocuments(query);

      return { packages, total };
    } catch (error: any) {
      logger.error("Error fetching service packages:", error);
      throw new AppError("Failed to fetch service packages", 500);
    }
  }

  /**
   * Get active service packages grouped by serviceId
   */
  async getActiveServicePackagesGrouped(): Promise<Record<string, IServicePackage[]>> {
    try {
      const packages = await ServicePackage.find({ status: "active" }).sort({
        serviceId: 1,
        order: 1,
      });

      // Group by serviceId
      const grouped: Record<string, IServicePackage[]> = {};
      packages.forEach((pkg) => {
        if (!grouped[pkg.serviceId]) {
          grouped[pkg.serviceId] = [];
        }
        grouped[pkg.serviceId].push(pkg);
      });

      return grouped;
    } catch (error: any) {
      logger.error("Error fetching active service packages:", error);
      throw new AppError("Failed to fetch active service packages", 500);
    }
  }

  /**
   * Get service package by ID
   */
  async getServicePackageById(id: string): Promise<IServicePackage | null> {
    try {
      const servicePackage = await ServicePackage.findById(id);

      if (!servicePackage) {
        throw new AppError("Service package not found", 404);
      }

      return servicePackage;
    } catch (error: any) {
      logger.error("Error fetching service package:", error);

      if (error.message === "Service package not found") {
        throw error;
      }

      throw new AppError("Failed to fetch service package", 500);
    }
  }

  /**
   * Update service package
   */
  async updateServicePackage(
    id: string,
    data: UpdateServicePackageDto
  ): Promise<IServicePackage | null> {
    try {
      const servicePackage = await ServicePackage.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      if (!servicePackage) {
        throw new AppError("Service package not found", 404);
      }

      logger.success(`Service package updated: ${servicePackage.name}`);
      return servicePackage;
    } catch (error: any) {
      logger.error("Error updating service package:", error);

      if (error.message === "Service package not found") {
        throw error;
      }

      throw new AppError("Failed to update service package", 500);
    }
  }

  /**
   * Delete service package
   */
  async deleteServicePackage(id: string): Promise<void> {
    try {
      const servicePackage = await ServicePackage.findByIdAndDelete(id);

      if (!servicePackage) {
        throw new AppError("Service package not found", 404);
      }

      logger.success(`Service package deleted: ${servicePackage.name}`);
    } catch (error: any) {
      logger.error("Error deleting service package:", error);

      if (error.message === "Service package not found") {
        throw error;
      }

      throw new AppError("Failed to delete service package", 500);
    }
  }
}

export default new ServicePackageService();


