/**
 * FundRequest Service
 * Business logic for fund request-related operations
 */

import { FundRequest, IFundRequest } from "./fundRequest.model";
import { User } from "../user/user.model";
import { AppError } from "@/utils/AppError";
import { logger } from "@/utils/logger";

export interface CreateFundRequestDto {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  paypalEmail?: string;
  notes?: string;
}

export interface UpdateFundRequestDto {
  status?: "pending" | "invoice-sent" | "paid" | "rejected";
  adminNotes?: string;
  processedBy?: string;
}

export interface FundRequestFilters {
  userId?: string;
  userEmail?: string;
  status?: string;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

class FundRequestService {
  /**
   * Create a new fund request
   */
  async createFundRequest(data: CreateFundRequestDto): Promise<IFundRequest> {
    try {
      // Verify user exists
      const user = await User.findById(data.userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      const fundRequest = new FundRequest({
        ...data,
        requestDate: new Date(),
        status: "pending",
      });

      await fundRequest.save();

      logger.success(
        `Fund request created: $${data.amount} from ${data.userName}`
      );
      return fundRequest;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error creating fund request:", error);
      throw new AppError("Failed to create fund request", 500);
    }
  }

  /**
   * Get all fund requests with filters
   */
  async getFundRequests(filters: FundRequestFilters = {}): Promise<{
    fundRequests: IFundRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const {
        userId,
        userEmail,
        status,
        page = 1,
        limit = 20,
        startDate,
        endDate,
      } = filters;

      // Build query
      const query: any = {};

      if (userId) query.userId = userId;
      if (userEmail) query.userEmail = userEmail;
      if (status) query.status = status;

      // Date range filter
      if (startDate || endDate) {
        query.requestDate = {};
        if (startDate) query.requestDate.$gte = startDate;
        if (endDate) query.requestDate.$lte = endDate;
      }

      const skip = (page - 1) * limit;

      const [fundRequests, total] = await Promise.all([
        FundRequest.find(query)
          .populate("userId", "user_nicename user_email")
          .sort({ requestDate: -1 })
          .skip(skip)
          .limit(limit),
        FundRequest.countDocuments(query),
      ]);

      return {
        fundRequests,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error("Error fetching fund requests:", error);
      throw new AppError("Failed to fetch fund requests", 500);
    }
  }

  /**
   * Get fund request by ID
   */
  async getFundRequestById(id: string): Promise<IFundRequest> {
    try {
      const fundRequest = await FundRequest.findById(id).populate(
        "userId",
        "user_nicename user_email"
      );
      if (!fundRequest) {
        throw new AppError("Fund request not found", 404);
      }
      return fundRequest;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error fetching fund request:", error);
      throw new AppError("Failed to fetch fund request", 500);
    }
  }

  /**
   * Update fund request
   */
  async updateFundRequest(
    id: string,
    data: UpdateFundRequestDto
  ): Promise<IFundRequest> {
    try {
      const fundRequest = await FundRequest.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!fundRequest) {
        throw new AppError("Fund request not found", 404);
      }

      logger.success(
        `Fund request updated: $${fundRequest.amount} from ${fundRequest.userName}`
      );
      return fundRequest;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error updating fund request:", error);
      throw new AppError("Failed to update fund request", 500);
    }
  }

  /**
   * Delete fund request
   */
  async deleteFundRequest(id: string): Promise<void> {
    try {
      const fundRequest = await FundRequest.findByIdAndDelete(id);
      if (!fundRequest) {
        throw new AppError("Fund request not found", 404);
      }

      logger.success(
        `Fund request deleted: $${fundRequest.amount} from ${fundRequest.userName}`
      );
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error deleting fund request:", error);
      throw new AppError("Failed to delete fund request", 500);
    }
  }

  /**
   * Approve fund request (mark as paid and update user balance)
   */
  async approveFundRequest(
    id: string,
    processedBy: string
  ): Promise<IFundRequest> {
    try {
      const fundRequest = await FundRequest.findById(id);
      if (!fundRequest) {
        throw new AppError("Fund request not found", 404);
      }

      if (fundRequest.status !== "pending") {
        throw new AppError("Only pending fund requests can be approved", 400);
      }

      // Update fund request status
      fundRequest.status = "paid";
      fundRequest.processedBy = processedBy;
      fundRequest.processedDate = new Date();
      await fundRequest.save();

      // Update user balance
      const user = await User.findById(fundRequest.userId);
      if (user) {
        user.balance += fundRequest.amount;
        await user.save();
      }

      logger.success(
        `Fund request approved: $${fundRequest.amount} added to ${fundRequest.userName}'s balance`
      );
      return fundRequest;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error approving fund request:", error);
      throw new AppError("Failed to approve fund request", 500);
    }
  }

  /**
   * Reject fund request
   */
  async rejectFundRequest(
    id: string,
    adminNotes: string,
    processedBy: string
  ): Promise<IFundRequest> {
    try {
      const fundRequest = await FundRequest.findByIdAndUpdate(
        id,
        {
          status: "rejected",
          adminNotes,
          processedBy,
          processedDate: new Date(),
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      );

      if (!fundRequest) {
        throw new AppError("Fund request not found", 404);
      }

      logger.success(
        `Fund request rejected: $${fundRequest.amount} from ${fundRequest.userName}`
      );
      return fundRequest;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error rejecting fund request:", error);
      throw new AppError("Failed to reject fund request", 500);
    }
  }

  /**
   * Get fund request statistics
   */
  async getFundRequestStats(userId?: string): Promise<{
    total: number;
    pending: number;
    invoiceSent: number;
    paid: number;
    rejected: number;
    totalAmount: number;
    pendingAmount: number;
    paidAmount: number;
  }> {
    try {
      const query = userId ? { userId } : {};

      const [total, pending, invoiceSent, paid, rejected, amountData] =
        await Promise.all([
          FundRequest.countDocuments(query),
          FundRequest.countDocuments({ ...query, status: "pending" }),
          FundRequest.countDocuments({ ...query, status: "invoice-sent" }),
          FundRequest.countDocuments({ ...query, status: "paid" }),
          FundRequest.countDocuments({ ...query, status: "rejected" }),
          FundRequest.aggregate([
            { $match: query },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
                pendingAmount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0],
                  },
                },
                paidAmount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0],
                  },
                },
              },
            },
          ]),
        ]);

      const totalAmount = amountData[0]?.totalAmount || 0;
      const pendingAmount = amountData[0]?.pendingAmount || 0;
      const paidAmount = amountData[0]?.paidAmount || 0;

      return {
        total,
        pending,
        invoiceSent,
        paid,
        rejected,
        totalAmount,
        pendingAmount,
        paidAmount,
      };
    } catch (error: any) {
      logger.error("Error fetching fund request stats:", error);
      throw new AppError("Failed to fetch fund request statistics", 500);
    }
  }

  /**
   * Get fund requests by user
   */
  async getFundRequestsByUser(
    userEmail: string,
    filters: Omit<FundRequestFilters, "userEmail"> = {}
  ): Promise<IFundRequest[]> {
    try {
      const query: any = { userEmail };

      if (filters.status) query.status = filters.status;

      if (filters.startDate || filters.endDate) {
        query.requestDate = {};
        if (filters.startDate) query.requestDate.$gte = filters.startDate;
        if (filters.endDate) query.requestDate.$lte = filters.endDate;
      }

      const fundRequests = await FundRequest.find(query).sort({
        requestDate: -1,
      });

      return fundRequests;
    } catch (error: any) {
      logger.error("Error fetching user fund requests:", error);
      throw new AppError("Failed to fetch user fund requests", 500);
    }
  }
}

export const fundRequestService = new FundRequestService();
