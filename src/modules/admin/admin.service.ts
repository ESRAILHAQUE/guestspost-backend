/**
 * Admin Service
 * Business logic for admin dashboard operations
 */

import { User } from "../user/user.model";
import { Website } from "../website/website.model";
import { Order } from "../order/order.model";
import { FundRequest } from "../fundRequest/fundRequest.model";
import { AppError } from "@/utils/AppError";
import { logger } from "@/utils/logger";

class AdminService {
  /**
   * Get comprehensive admin dashboard statistics
   */
  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalWebsites: number;
    activeWebsites: number;
    totalOrders: number;
    totalFundRequests: number;
    pendingFundRequests: number;
    totalRevenue: number;
    recentOrders: any[];
    recentUsers: any[];
    recentFundRequests: any[];
    websiteStats: {
      byCategory: Record<string, number>;
      bySection: Record<string, number>;
    };
    orderStats: {
      byStatus: Record<string, number>;
      monthlyRevenue: number;
    };
  }> {
    try {
      // Get basic counts
      const [
        totalUsers,
        activeUsers,
        totalWebsites,
        activeWebsites,
        totalOrders,
        totalFundRequests,
        pendingFundRequests,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ user_status: "active" }),
        Website.countDocuments(),
        Website.countDocuments({ status: "active" }),
        Order.countDocuments(),
        FundRequest.countDocuments(),
        FundRequest.countDocuments({ status: "pending" }),
      ]);

      // Get revenue data
      const revenueData = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$price" },
            monthlyRevenue: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      "$createdAt",
                      new Date(new Date().setMonth(new Date().getMonth() - 1)),
                    ],
                  },
                  "$price",
                  0,
                ],
              },
            },
          },
        },
      ]);

      const totalRevenue = revenueData[0]?.totalRevenue || 0;
      const monthlyRevenue = revenueData[0]?.monthlyRevenue || 0;

      // Get website statistics
      const [websiteCategoryStats, websiteSectionStats] = await Promise.all([
        Website.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Website.aggregate([
          { $group: { _id: "$section", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

      const websiteStats = {
        byCategory: websiteCategoryStats.reduce(
          (acc: Record<string, number>, stat: any) => {
            acc[stat._id] = stat.count;
            return acc;
          },
          {}
        ),
        bySection: websiteSectionStats.reduce(
          (acc: Record<string, number>, stat: any) => {
            acc[stat._id] = stat.count;
            return acc;
          },
          {}
        ),
      };

      // Get order statistics
      const orderStatusStats = await Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const orderStats = {
        byStatus: orderStatusStats.reduce(
          (acc: Record<string, number>, stat: any) => {
            acc[stat._id] = stat.count;
            return acc;
          },
          {}
        ),
        monthlyRevenue,
      };

      // Get recent data
      const [recentOrders, recentUsers, recentFundRequests] = await Promise.all([
        Order.find()
          .populate("userId", "user_nicename user_email")
          .sort({ createdAt: -1 })
          .limit(5),
        User.find()
          .select("user_nicename user_email registration_date user_status")
          .sort({ registration_date: -1 })
          .limit(5),
        FundRequest.find()
          .populate("userId", "user_nicename user_email")
          .sort({ requestDate: -1 })
          .limit(5),
      ]);

      logger.success("Admin stats retrieved successfully");

      return {
        totalUsers,
        activeUsers,
        totalWebsites,
        activeWebsites,
        totalOrders,
        totalFundRequests,
        pendingFundRequests,
        totalRevenue,
        recentOrders,
        recentUsers,
        recentFundRequests,
        websiteStats,
        orderStats,
      };
    } catch (error: any) {
      logger.error("Error fetching admin stats:", error);
      throw new AppError("Failed to fetch admin statistics", 500);
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    database: boolean;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    timestamp: string;
  }> {
    try {
      // Test database connection
      const dbTest = await User.findOne().limit(1);
      const database = !!dbTest;

      return {
        database,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error("Error checking system health:", error);
      throw new AppError("Failed to check system health", 500);
    }
  }

  /**
   * Get activity logs (simplified version)
   */
  async getActivityLogs(limit: number = 50): Promise<any[]> {
    try {
      // This is a simplified version - in production you'd want a dedicated activity log collection
      const recentActivities = await Promise.all([
        Order.find()
          .select("item_name userName status createdAt")
          .sort({ createdAt: -1 })
          .limit(limit / 3),
        FundRequest.find()
          .select("userName amount status requestDate")
          .sort({ requestDate: -1 })
          .limit(limit / 3),
        User.find()
          .select("user_nicename user_email registration_date")
          .sort({ registration_date: -1 })
          .limit(limit / 3),
      ]);

      const activities = [
        ...recentActivities[0].map((order) => ({
          type: "order",
          description: `Order "${order.item_name}" ${order.status} by ${order.userName}`,
          timestamp: order.createdAt,
        })),
        ...recentActivities[1].map((request) => ({
          type: "fund_request",
          description: `Fund request $${request.amount} ${request.status} by ${request.userName}`,
          timestamp: request.requestDate,
        })),
        ...recentActivities[2].map((user) => ({
          type: "user_registration",
          description: `New user registered: ${user.user_nicename}`,
          timestamp: user.registration_date,
        })),
      ];

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error: any) {
      logger.error("Error fetching activity logs:", error);
      throw new AppError("Failed to fetch activity logs", 500);
    }
  }
}

export const adminService = new AdminService();
