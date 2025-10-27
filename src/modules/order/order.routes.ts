/**
 * Order Routes
 * API routes for order management
 */

import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  completeOrder,
  getOrderStats,
  getOrdersByUser,
} from "./order.controller";
import { protect, authorize } from "@/middlewares";
import { validate } from "@/middlewares/validation.middleware";
import { body, param } from "express-validator";

const router = Router();

// Validation rules
const createOrderValidation = [
  body("userId").isMongoId().withMessage("Invalid user ID"),
  body("user_id").trim().notEmpty().withMessage("User email is required"),
  body("userName").trim().notEmpty().withMessage("User name is required"),
  body("userEmail").isEmail().withMessage("Please provide a valid email"),
  body("item_name").trim().notEmpty().withMessage("Item name is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("type").trim().notEmpty().withMessage("Order type is required"),
];

const updateOrderValidation = [
  param("id").isMongoId().withMessage("Invalid order ID"),
  body("status")
    .optional()
    .isIn(["processing", "completed", "failed", "pending"])
    .withMessage("Invalid status"),
  body("price").optional().isNumeric().withMessage("Price must be a number"),
];

const completeOrderValidation = [
  param("id").isMongoId().withMessage("Invalid order ID"),
  body("completionMessage")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Completion message cannot be empty"),
  body("completionLink")
    .optional()
    .isURL()
    .withMessage("Please provide a valid completion link"),
];

const orderIdValidation = [
  param("id").isMongoId().withMessage("Invalid order ID"),
];

const userEmailValidation = [
  param("userEmail").isEmail().withMessage("Please provide a valid email"),
];

// Public routes
router.get("/stats", getOrderStats);

// Protected routes (User and Admin)
router.post("/", protect, validate(createOrderValidation), createOrder);
router.get("/", protect, getOrders);
router.get(
  "/user/:userEmail",
  protect,
  validate(userEmailValidation),
  getOrdersByUser
);
router.get("/:id", protect, validate(orderIdValidation), getOrderById);
router.put("/:id", protect, validate(updateOrderValidation), updateOrder);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validate(orderIdValidation),
  deleteOrder
);

// Admin only routes
router.patch(
  "/:id/complete",
  protect,
  authorize("admin"),
  validate(completeOrderValidation),
  completeOrder
);

export { router as orderRoutes };
