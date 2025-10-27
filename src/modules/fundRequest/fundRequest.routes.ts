/**
 * FundRequest Routes
 * API routes for fund request management
 */

import { Router } from "express";
import {
  createFundRequest,
  getFundRequests,
  getFundRequestById,
  updateFundRequest,
  deleteFundRequest,
  approveFundRequest,
  rejectFundRequest,
  getFundRequestStats,
  getFundRequestsByUser,
} from "./fundRequest.controller";
import { protect, authorize } from "@/middlewares";
import { validate } from "@/middlewares/validation.middleware";
import { body, param } from "express-validator";

const router = Router();

// Validation rules
const createFundRequestValidation = [
  body("userId").isMongoId().withMessage("Invalid user ID"),
  body("userName").trim().notEmpty().withMessage("User name is required"),
  body("userEmail").isEmail().withMessage("Please provide a valid email"),
  body("amount").isNumeric().withMessage("Amount must be a number"),
  body("paypalEmail")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid PayPal email"),
];

const updateFundRequestValidation = [
  param("id").isMongoId().withMessage("Invalid fund request ID"),
  body("status")
    .optional()
    .isIn(["pending", "invoice-sent", "paid", "rejected"])
    .withMessage("Invalid status"),
  body("amount").optional().isNumeric().withMessage("Amount must be a number"),
];

const approveFundRequestValidation = [
  param("id").isMongoId().withMessage("Invalid fund request ID"),
  body("processedBy").trim().notEmpty().withMessage("Processed by is required"),
];

const rejectFundRequestValidation = [
  param("id").isMongoId().withMessage("Invalid fund request ID"),
  body("adminNotes").trim().notEmpty().withMessage("Admin notes are required"),
  body("processedBy").trim().notEmpty().withMessage("Processed by is required"),
];

const fundRequestIdValidation = [
  param("id").isMongoId().withMessage("Invalid fund request ID"),
];

const userEmailValidation = [
  param("userEmail").isEmail().withMessage("Please provide a valid email"),
];

// Public routes
router.get("/stats", getFundRequestStats);

// Protected routes (User and Admin)
router.post(
  "/",
  protect,
  validate(createFundRequestValidation),
  createFundRequest
);
router.get("/", protect, getFundRequests);
router.get(
  "/user/:userEmail",
  protect,
  validate(userEmailValidation),
  getFundRequestsByUser
);
router.get(
  "/:id",
  protect,
  validate(fundRequestIdValidation),
  getFundRequestById
);
router.put(
  "/:id",
  protect,
  validate(updateFundRequestValidation),
  updateFundRequest
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validate(fundRequestIdValidation),
  deleteFundRequest
);

// Admin only routes
router.patch(
  "/:id/approve",
  protect,
  authorize("admin"),
  validate(approveFundRequestValidation),
  approveFundRequest
);
router.patch(
  "/:id/reject",
  protect,
  authorize("admin"),
  validate(rejectFundRequestValidation),
  rejectFundRequest
);

export { router as fundRequestRoutes };
