/**
 * Payment Controller
 * Handles payment-related HTTP requests
 */

import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/middlewares";
import { ApiResponse } from "@/utils/apiResponse";
import {
  paymentService,
  CreateStripePaymentIntentDto,
  CreatePayPalPaymentDto,
} from "./payment.service";

/**
 * Create Stripe Payment Intent
 */
export const createStripePaymentIntent = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { amount, currency, orderId, metadata } = req.body;
    const userId = req.user?.userId || req.body.userId;
    const userEmail = req.user?.email || req.body.userEmail;

    if (!amount || amount <= 0) {
      return ApiResponse.badRequest(res, "Invalid amount");
    }

    if (!userId || !userEmail) {
      return ApiResponse.badRequest(res, "User information is required");
    }

    const paymentData: CreateStripePaymentIntentDto = {
      amount: parseFloat(amount),
      currency: currency || "usd",
      userId: userId.toString(),
      userEmail,
      orderId,
      metadata,
    };

    const result = await paymentService.createStripePaymentIntent(paymentData);
    return ApiResponse.success(res, result, "Payment intent created successfully");
  }
);

/**
 * Verify Stripe Payment
 */
export const verifyStripePayment = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return ApiResponse.badRequest(res, "Payment intent ID is required");
    }

    const isVerified = await paymentService.verifyStripePayment(
      paymentIntentId
    );
    return ApiResponse.success(
      res,
      { verified: isVerified },
      isVerified
        ? "Payment verified successfully"
        : "Payment verification failed"
    );
  }
);

/**
 * Create PayPal Payment
 */
export const createPayPalPayment = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { amount, currency, orderId, description } = req.body;
    const userId = req.user?.userId || req.body.userId;
    const userEmail = req.user?.email || req.body.userEmail;

    if (!amount || amount <= 0) {
      return ApiResponse.badRequest(res, "Invalid amount");
    }

    if (!userId || !userEmail) {
      return ApiResponse.badRequest(res, "User information is required");
    }

    const paymentData: CreatePayPalPaymentDto = {
      amount: parseFloat(amount),
      currency: currency || "USD",
      userId: userId.toString(),
      userEmail,
      orderId,
      description,
    };

    const result = await paymentService.createPayPalPayment(paymentData);
    return ApiResponse.success(res, result, "PayPal payment created successfully");
  }
);

/**
 * Execute PayPal Payment
 */
export const executePayPalPayment = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { paymentId, payerId } = req.body;

    if (!paymentId || !payerId) {
      return ApiResponse.badRequest(
        res,
        "Payment ID and Payer ID are required"
      );
    }

    const result = await paymentService.executePayPalPayment(
      paymentId,
      payerId
    );
    return ApiResponse.success(res, result, "PayPal payment executed successfully");
  }
);

/**
 * Get Stripe Publishable Key
 */
export const getStripePublishableKey = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const publishableKey = paymentService.getStripePublishableKey();
    return ApiResponse.success(
      res,
      { publishableKey },
      "Stripe publishable key retrieved"
    );
  }
);

