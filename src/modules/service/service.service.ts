import { Service, IService } from "./service.model";
import { AppError } from "@/utils/AppError";
import { logger } from "@/utils/logger";

export interface CreateServiceDto {
  title: string;
  description: string;
  icon?: string;
  status?: "active" | "inactive";
  order?: number;
}

export interface UpdateServiceDto {
  title?: string;
  description?: string;
  icon?: string;
  status?: "active" | "inactive";
  order?: number;
}

export interface ServiceFilters {
  status?: "active" | "inactive";
  search?: string;
}

class ServiceService {
  /**
   * Create a new service
   */
  async createService(data: CreateServiceDto): Promise<IService> {
    try {
      const service = new Service(data);
      await service.save();

      logger.success(`Service created: ${service.title}`);
      return service;
    } catch (error: any) {
      logger.error("Error creating service:", error);
      
      if (error.code === 11000) {
        throw new AppError("A service with this title already exists", 409);
      }
      
      throw new AppError(error.message || "Failed to create service", 500);
    }
  }

  /**
   * Get all services with filters
   */
  async getServices(filters: ServiceFilters = {}): Promise<{
    services: IService[];
    total: number;
  }> {
    try {
      const { status, search } = filters;

      const query: any = {};

      if (status) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const services = await Service.find(query).sort({ order: 1, createdAt: -1 });
      const total = await Service.countDocuments(query);

      return { services, total };
    } catch (error: any) {
      logger.error("Error fetching services:", error);
      throw new AppError("Failed to fetch services", 500);
    }
  }

  /**
   * Get active services only
   */
  async getActiveServices(): Promise<IService[]> {
    try {
      const services = await Service.find({ status: "active" }).sort({
        order: 1,
        createdAt: -1,
      });

      return services;
    } catch (error: any) {
      logger.error("Error fetching active services:", error);
      throw new AppError("Failed to fetch active services", 500);
    }
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<IService | null> {
    try {
      const service = await Service.findById(id);

      if (!service) {
        throw new AppError("Service not found", 404);
      }

      return service;
    } catch (error: any) {
      logger.error("Error fetching service:", error);
      
      if (error.message === "Service not found") {
        throw error;
      }
      
      throw new AppError("Failed to fetch service", 500);
    }
  }

  /**
   * Update service
   */
  async updateService(
    id: string,
    data: UpdateServiceDto
  ): Promise<IService | null> {
    try {
      const service = await Service.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      if (!service) {
        throw new AppError("Service not found", 404);
      }

      logger.success(`Service updated: ${service.title}`);
      return service;
    } catch (error: any) {
      logger.error("Error updating service:", error);
      
      if (error.message === "Service not found") {
        throw error;
      }
      
      throw new AppError("Failed to update service", 500);
    }
  }

  /**
   * Delete service
   */
  async deleteService(id: string): Promise<void> {
    try {
      const service = await Service.findByIdAndDelete(id);

      if (!service) {
        throw new AppError("Service not found", 404);
      }

      logger.success(`Service deleted: ${service.title}`);
    } catch (error: any) {
      logger.error("Error deleting service:", error);
      
      if (error.message === "Service not found") {
        throw error;
      }
      
      throw new AppError("Failed to delete service", 500);
    }
  }
}

export default new ServiceService();


