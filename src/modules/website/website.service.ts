/**
 * Website Service
 * Business logic for website-related operations
 */

import { Website, IWebsite } from "./website.model";
import { AppError } from "@/utils/AppError";
import { logger } from "@/utils/logger";

export interface CreateWebsiteDto {
  name: string;
  url: string;
  category: string;
  niche: string;
  section?: "standard" | "premium";
  da: number;
  dr: number;
  traffic: string;
  language?: string;
  country: string;
  status?: "active" | "pending" | "inactive";
  delivery: string;
  doFollowPrice: number;
  noFollowPrice: number;
  standardPrice?: number;
  premiumDoFollowPrice?: number;
  premiumNoFollowPrice?: number;
  description?: string;
  guidelines?: string;
  logo?: string;
}

export interface UpdateWebsiteDto {
  name?: string;
  url?: string;
  category?: string;
  niche?: string;
  section?: "standard" | "premium";
  da?: number;
  dr?: number;
  traffic?: string;
  language?: string;
  country?: string;
  status?: "active" | "pending" | "inactive";
  delivery?: string;
  doFollowPrice?: number;
  noFollowPrice?: number;
  standardPrice?: number;
  premiumDoFollowPrice?: number;
  premiumNoFollowPrice?: number;
  description?: string;
  guidelines?: string;
  logo?: string;
}

export interface WebsiteFilters {
  status?: string;
  category?: string;
  niche?: string;
  section?: string;
  minDa?: number;
  maxDa?: number;
  minDr?: number;
  maxDr?: number;
  search?: string;
  page?: number;
  limit?: number;
}

class WebsiteService {
  /**
   * Create a new website
   */
  async createWebsite(data: CreateWebsiteDto): Promise<IWebsite> {
    try {
      const website = new Website(data);
      await website.save();

      logger.success(`Website created: ${website.name}`);
      return website;
    } catch (error: any) {
      logger.error("Error creating website:", error);
      throw new AppError("Failed to create website", 500);
    }
  }

  /**
   * Get all websites with filters
   */
  async getWebsites(filters: WebsiteFilters = {}): Promise<{
    websites: IWebsite[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const {
        status,
        category,
        niche,
        section,
        minDa,
        maxDa,
        minDr,
        maxDr,
        search,
        page = 1,
        limit = 20,
      } = filters;

      // Build query
      const query: any = {};

      if (status) query.status = status;
      if (category) query.category = category;
      if (niche) query.niche = niche;
      if (section) query.section = section;

      // DA range filter
      if (minDa !== undefined || maxDa !== undefined) {
        query.da = {};
        if (minDa !== undefined) query.da.$gte = minDa;
        if (maxDa !== undefined) query.da.$lte = maxDa;
      }

      // DR range filter
      if (minDr !== undefined || maxDr !== undefined) {
        query.dr = {};
        if (minDr !== undefined) query.dr.$gte = minDr;
        if (maxDr !== undefined) query.dr.$lte = maxDr;
      }

      // Text search
      if (search) {
        query.$text = { $search: search };
      }

      const skip = (page - 1) * limit;

      const [websites, total] = await Promise.all([
        Website.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Website.countDocuments(query),
      ]);

      return {
        websites,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error("Error fetching websites:", error);
      throw new AppError("Failed to fetch websites", 500);
    }
  }

  /**
   * Get website by ID
   */
  async getWebsiteById(id: string): Promise<IWebsite> {
    try {
      const website = await Website.findById(id);
      if (!website) {
        throw new AppError("Website not found", 404);
      }
      return website;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error fetching website:", error);
      throw new AppError("Failed to fetch website", 500);
    }
  }

  /**
   * Update website
   */
  async updateWebsite(id: string, data: UpdateWebsiteDto): Promise<IWebsite> {
    try {
      const website = await Website.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!website) {
        throw new AppError("Website not found", 404);
      }

      logger.success(`Website updated: ${website.name}`);
      return website;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error updating website:", error);
      throw new AppError("Failed to update website", 500);
    }
  }

  /**
   * Delete website
   */
  async deleteWebsite(id: string): Promise<void> {
    try {
      const website = await Website.findByIdAndDelete(id);
      if (!website) {
        throw new AppError("Website not found", 404);
      }

      logger.success(`Website deleted: ${website.name}`);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error deleting website:", error);
      throw new AppError("Failed to delete website", 500);
    }
  }

  /**
   * Get website statistics
   */
  async getWebsiteStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    inactive: number;
    byCategory: Record<string, number>;
    bySection: Record<string, number>;
  }> {
    try {
      const [total, active, pending, inactive, categoryStats, sectionStats] =
        await Promise.all([
          Website.countDocuments(),
          Website.countDocuments({ status: "active" }),
          Website.countDocuments({ status: "pending" }),
          Website.countDocuments({ status: "inactive" }),
          Website.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
          Website.aggregate([
            { $group: { _id: "$section", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
        ]);

      const byCategory = categoryStats.reduce(
        (acc: Record<string, number>, stat: any) => {
          acc[stat._id] = stat.count;
          return acc;
        },
        {}
      );

      const bySection = sectionStats.reduce(
        (acc: Record<string, number>, stat: any) => {
          acc[stat._id] = stat.count;
          return acc;
        },
        {}
      );

      return {
        total,
        active,
        pending,
        inactive,
        byCategory,
        bySection,
      };
    } catch (error: any) {
      logger.error("Error fetching website stats:", error);
      throw new AppError("Failed to fetch website statistics", 500);
    }
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const categories = await Website.distinct("category");
      return categories.sort();
    } catch (error: any) {
      logger.error("Error fetching categories:", error);
      throw new AppError("Failed to fetch categories", 500);
    }
  }

  /**
   * Get niches
   */
  async getNiches(): Promise<string[]> {
    try {
      const niches = await Website.distinct("niche");
      return niches.sort();
    } catch (error: any) {
      logger.error("Error fetching niches:", error);
      throw new AppError("Failed to fetch niches", 500);
    }
  }
}

export const websiteService = new WebsiteService();
