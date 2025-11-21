/**
 * Payment Routes
 * API routes for payment processing
 */

import { Router } from "express";
import {
  createStripePaymentIntent,
  verifyStripePayment,
  createPayPalPayment,
  executePayPalPayment,
  getStripePublishableKey,
} from "./payment.controller";
import { protect } from "@/middlewares";
import { validate } from "@/middlewares/validation.middleware";
import { body, param } from "express-validator";

const router = Router();

// Validation rules
const createStripePaymentValidation = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("currency").optional().isString(),
  body("orderId").optional().isString(),
  body("userEmail")
    .optional()
    .isEmail()
    .withMessage("Valid email is required"),
];

const createPayPalPaymentValidation = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("currency").optional().isString(),
  body("orderId").optional().isString(),
  body("description").optional().isString(),
  body("userEmail")
    .optional()
    .isEmail()
    .withMessage("Valid email is required"),
];

const executePayPalPaymentValidation = [
  body("paymentId").notEmpty().withMessage("Payment ID is required"),
  body("payerId").notEmpty().withMessage("Payer ID is required"),
];

const paymentIntentIdValidation = [
  param("paymentIntentId")
    .notEmpty()
    .withMessage("Payment intent ID is required"),
];

// Public routes
router.get("/stripe/publishable-key", getStripePublishableKey);

// Protected routes
router.use(protect);

router.post(
  "/stripe/create-intent",
  validate(createStripePaymentValidation),
  createStripePaymentIntent
);

router.get(
  "/stripe/verify/:paymentIntentId",
  validate(paymentIntentIdValidation),
  verifyStripePayment
);

router.post(
  "/paypal/create",
  validate(createPayPalPaymentValidation),
  createPayPalPayment
);

router.post(
  "/paypal/execute",
  validate(executePayPalPaymentValidation),
  executePayPalPayment
);

// Test endpoint to verify PayPal credentials (for debugging)
router.get("/paypal/test-credentials", async (_req, res) => {
  const { config } = await import("@/config/env.config");
  return res.json({
    success: true,
    data: {
      mode: config.paypal.mode,
      clientIdSet: !!config.paypal.clientId,
      clientSecretSet: !!config.paypal.clientSecret,
      clientIdLength: config.paypal.clientId?.length || 0,
      clientSecretLength: config.paypal.clientSecret?.length || 0,
      clientIdPreview: config.paypal.clientId ? `${config.paypal.clientId.substring(0, 20)}...` : "NOT SET",
      message: "Check PayPal Developer Dashboard to verify these credentials match your sandbox app",
    },
  });
});

export { router as paymentRoutes };

