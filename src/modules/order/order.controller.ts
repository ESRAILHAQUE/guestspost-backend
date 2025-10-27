/**
 * Order Controller
 * Handles HTTP requests for order management
 */

import { Request, Response, NextFunction } from "express";
import {
  orderService,
  CreateOrderDto,
  UpdateOrderDto,
  OrderFilters,
} from "./order.service";
import { asyncHandler } from "@/middlewares";
import { ApiResponse } from "@/utils/apiResponse";

/**
 * Create a new order
 */
export const createOrder = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const orderData: CreateOrderDto = req.body;

    const order = await orderService.createOrder(orderData);

    ApiResponse.created(res, order, "Order created successfully");
  }
);

/**
 * Get all orders with filters
 */
export const getOrders = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters: OrderFilters = {
      userId: req.query.userId as string,
      userEmail: req.query.userEmail as string,
      status: req.query.status as string,
      type: req.query.type as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
    };

    const result = await orderService.getOrders(filters);

    ApiResponse.paginated(
      res,
      result.orders,
      result.page,
      result.limit,
      result.total,
      "Orders retrieved successfully"
    );
  }
);

/**
 * Get order by ID
 */
export const getOrderById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const order = await orderService.getOrderById(id);

    ApiResponse.success(res, order, "Order retrieved successfully");
  }
);

/**
 * Update order
 */
export const updateOrder = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updateData: UpdateOrderDto = req.body;

    const order = await orderService.updateOrder(id, updateData);

    ApiResponse.success(res, order, "Order updated successfully");
  }
);

/**
 * Delete order
 */
export const deleteOrder = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    await orderService.deleteOrder(id);

    ApiResponse.success(res, null, "Order deleted successfully");
  }
);

/**
 * Complete order
 */
export const completeOrder = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { completionMessage, completionLink } = req.body;

    const order = await orderService.completeOrder(
      id,
      completionMessage,
      completionLink
    );

    ApiResponse.success(res, order, "Order completed successfully");
  }
);

/**
 * Get order statistics
 */
export const getOrderStats = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.query.userId as string;

    const stats = await orderService.getOrderStats(userId);

    ApiResponse.success(res, stats, "Order statistics retrieved successfully");
  }
);

/**
 * Get orders by user
 */
export const getOrdersByUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { userEmail } = req.params;
    const filters = {
      status: req.query.status as string,
      type: req.query.type as string,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
    };

    const orders = await orderService.getOrdersByUser(userEmail, filters);

    ApiResponse.success(res, orders, "User orders retrieved successfully");
  }
);
