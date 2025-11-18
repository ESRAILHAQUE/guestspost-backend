/**
 * Order Service
 * Business logic for order-related operations
 */

import { Order, IOrder } from "./order.model";
import { User } from "../user/user.model";
import { AppError } from "@/utils/AppError";
import { logger } from "@/utils/logger";
import {
  sendOrderConfirmationEmail,
  sendOrderCompletionEmail,
  sendOrderStatusUpdateEmail,
} from "@/utils/email.utils";

export interface CreateOrderDto {
  userId: string;
  user_id: string;
  userName: string;
  userEmail: string;
  item_name: string;
  price: number;
  type: string;
  description?: string;
  features?: string[];
  article?: string;
  file?: {
    name: string;
    type: string;
    size: number;
    data: string;
  };
  message?: string;
}

export interface UpdateOrderDto {
  status?: "processing" | "completed" | "failed" | "pending";
  description?: string;
  features?: string[];
  article?: string;
  file?: {
    name: string;
    type: string;
    size: number;
    data: string;
  };
  message?: string;
  completionMessage?: string;
  completionLink?: string;
  completedAt?: Date;
}

export interface OrderFilters {
  userId?: string;
  userEmail?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

class OrderService {
  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderDto): Promise<IOrder> {
    try {
      // Verify user exists
      const user = await User.findById(data.userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Get order amount (use price or amount field from request)
      const orderAmount = data.price || (data as any).amount || 0;

      if (orderAmount <= 0) {
        throw new AppError("Order amount must be greater than 0", 400);
      }

      // Note: Balance check and deduction will be handled by frontend after order creation
      // This allows users to submit order details first, then process payment

      // Create order with proper price field (status: pending, payment will be processed separately)
      const order = new Order({
        ...data,
        price: orderAmount, // Ensure price is set
        date: new Date(),
        status: "pending", // Order starts as pending, will be updated after payment
      });

      // Save order (without deducting balance)
      await order.save();

      logger.success(
        `Order created: ${order.item_name} for ${order.userName}. Amount: $${orderAmount}. Payment will be processed separately.`
      );
      return order;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error creating order:", error);
      throw new AppError("Failed to create order", 500);
    }
  }

  /**
   * Get all orders with filters
   */
  async getOrders(filters: OrderFilters = {}): Promise<{
    orders: IOrder[];
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
        type,
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
      if (type) query.type = type;

      // Date range filter
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = startDate;
        if (endDate) query.createdAt.$lte = endDate;
      }

      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate("userId", "user_nicename user_email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Order.countDocuments(query),
      ]);

      return {
        orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error("Error fetching orders:", error);
      throw new AppError("Failed to fetch orders", 500);
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<IOrder> {
    try {
      const order = await Order.findById(id).populate(
        "userId",
        "user_nicename user_email"
      );
      if (!order) {
        throw new AppError("Order not found", 404);
      }
      return order;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error fetching order:", error);
      throw new AppError("Failed to fetch order", 500);
    }
  }

  /**
   * Update order
   */
  async updateOrder(id: string, data: UpdateOrderDto): Promise<IOrder> {
    try {
      // Get the previous order to track status changes
      const previousOrder = await Order.findById(id);
      if (!previousOrder) {
        throw new AppError("Order not found", 404);
      }

      const previousStatus = previousOrder.status;

      // Update the order
      const order = await Order.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      const newStatus = order.status;

      // Send email notifications based on status changes
      if (newStatus !== previousStatus) {
        try {
          // Payment completed: pending -> processing
          if (previousStatus === "pending" && newStatus === "processing") {
            await sendOrderConfirmationEmail({
              id: order._id.toString(),
              item_name: order.item_name,
              price: order.price,
              userName: order.userName,
              userEmail: order.userEmail,
              orderDate: order.date || order.createdAt,
              type: order.type,
            });
            logger.success(
              `Payment confirmation email sent for order ${order._id}`
            );
          }
          // Order completed
          else if (newStatus === "completed") {
            await sendOrderCompletionEmail({
              id: order._id.toString(),
              item_name: order.item_name,
              price: order.price,
              userName: order.userName,
              userEmail: order.userEmail,
              orderDate: order.date || order.createdAt,
              completedAt: order.completedAt || new Date(),
              completionMessage: order.completionMessage,
              completionLink: order.completionLink,
              type: order.type,
            });
            logger.success(
              `Order completion email sent for order ${order._id}`
            );
          }
          // Other status updates (failed, etc.)
          else if (
            newStatus === "failed" ||
            (newStatus === "processing" && previousStatus !== "pending")
          ) {
            await sendOrderStatusUpdateEmail({
              id: order._id.toString(),
              item_name: order.item_name,
              price: order.price,
              userName: order.userName,
              userEmail: order.userEmail,
              status: newStatus,
              orderDate: order.date || order.createdAt,
              type: order.type,
              message: data.message,
            });
            logger.success(
              `Order status update email sent for order ${order._id}`
            );
          }
        } catch (emailError: any) {
          // Log email error but don't fail the order update
          logger.error(
            `Failed to send email notification for order ${order._id}:`,
            emailError
          );
        }
      }

      logger.success(`Order updated: ${order.item_name}`);
      return order;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error updating order:", error);
      throw new AppError("Failed to update order", 500);
    }
  }

  /**
   * Delete order
   */
  async deleteOrder(id: string): Promise<void> {
    try {
      const order = await Order.findByIdAndDelete(id);
      if (!order) {
        throw new AppError("Order not found", 404);
      }

      logger.success(`Order deleted: ${order.item_name}`);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error deleting order:", error);
      throw new AppError("Failed to delete order", 500);
    }
  }

  /**
   * Complete order
   */
  async completeOrder(
    id: string,
    completionMessage?: string,
    completionLink?: string
  ): Promise<IOrder> {
    try {
      const order = await Order.findByIdAndUpdate(
        id,
        {
          status: "completed",
          completionMessage,
          completionLink,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      );

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      // Send completion email
      try {
        await sendOrderCompletionEmail({
          id: order._id.toString(),
          item_name: order.item_name,
          price: order.price,
          userName: order.userName,
          userEmail: order.userEmail,
          orderDate: order.date || order.createdAt,
          completedAt: order.completedAt || new Date(),
          completionMessage: order.completionMessage,
          completionLink: order.completionLink,
          type: order.type,
        });
        logger.success(`Order completion email sent for order ${order._id}`);
      } catch (emailError: any) {
        // Log email error but don't fail the order completion
        logger.error(
          `Failed to send completion email for order ${order._id}:`,
          emailError
        );
      }

      logger.success(`Order completed: ${order.item_name}`);
      return order;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error completing order:", error);
      throw new AppError("Failed to complete order", 500);
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(userId?: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> {
    try {
      const query = userId ? { userId } : {};

      const [total, pending, processing, completed, failed, revenueData] =
        await Promise.all([
          Order.countDocuments(query),
          Order.countDocuments({ ...query, status: "pending" }),
          Order.countDocuments({ ...query, status: "processing" }),
          Order.countDocuments({ ...query, status: "completed" }),
          Order.countDocuments({ ...query, status: "failed" }),
          Order.aggregate([
            { $match: query },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$price" },
                averageOrderValue: { $avg: "$price" },
              },
            },
          ]),
        ]);

      const totalRevenue = revenueData[0]?.totalRevenue || 0;
      const averageOrderValue = revenueData[0]?.averageOrderValue || 0;

      return {
        total,
        pending,
        processing,
        completed,
        failed,
        totalRevenue,
        averageOrderValue,
      };
    } catch (error: any) {
      logger.error("Error fetching order stats:", error);
      throw new AppError("Failed to fetch order statistics", 500);
    }
  }

  /**
   * Get orders by user
   */
  async getOrdersByUser(
    userEmail: string,
    filters: Omit<OrderFilters, "userEmail"> = {}
  ): Promise<IOrder[]> {
    try {
      const query: any = { userEmail };

      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = filters.startDate;
        if (filters.endDate) query.createdAt.$lte = filters.endDate;
      }

      const orders = await Order.find(query).sort({ createdAt: -1 });

      return orders;
    } catch (error: any) {
      logger.error("Error fetching user orders:", error);
      throw new AppError("Failed to fetch user orders", 500);
    }
  }
}

export const orderService = new OrderService();
