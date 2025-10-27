/**
 * Package Service
 * Business logic for package management
 */

import { Package, IPackage } from "./package.model";
import { CreatePackageDto, UpdatePackageDto } from "./package.dto";

export class PackageService {
  /**
   * Create a new package
   */
  async createPackage(packageData: CreatePackageDto): Promise<IPackage> {
    const newPackage = new Package(packageData);
    return await newPackage.save();
  }

  /**
   * Get all packages
   */
  async getAllPackages(): Promise<IPackage[]> {
    return await Package.find().sort({ createdAt: -1 });
  }

  /**
   * Get active packages only
   */
  async getActivePackages(): Promise<IPackage[]> {
    return await Package.find({ status: "active" }).sort({ price: 1 });
  }

  /**
   * Get package by ID
   */
  async getPackageById(id: string): Promise<IPackage | null> {
    return await Package.findById(id);
  }

  /**
   * Update package
   */
  async updatePackage(
    id: string,
    updateData: UpdatePackageDto
  ): Promise<IPackage | null> {
    return await Package.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete package
   */
  async deletePackage(id: string): Promise<void> {
    await Package.findByIdAndDelete(id);
  }

  /**
   * Get package statistics
   */
  async getPackageStats() {
    const total = await Package.countDocuments();
    const active = await Package.countDocuments({ status: "active" });
    const popular = await Package.countDocuments({ popular: true });

    return {
      total,
      active,
      inactive: total - active,
      popular,
    };
  }
}

export const packageService = new PackageService();
// Enhanced package service
