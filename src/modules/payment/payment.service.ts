/**
 * Payment Service
 * Handles payment processing with Stripe and PayPal
 */

import Stripe from "stripe";
import { config } from "@/config/env.config";
import { AppError } from "@/utils/AppError";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - paypal-rest-sdk doesn't have official types, using declaration from src/types/paypal-rest-sdk.d.ts
import * as paypal from "paypal-rest-sdk";

// Initialize Stripe
const stripe = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey, {
      apiVersion: "2025-02-24.acacia",
    })
  : null;

// Configure PayPal
let paypalConfigured = false;
if (config.paypal.clientId && config.paypal.clientSecret) {
  try {
    // Remove any whitespace or newlines from credentials
    const clientId = config.paypal.clientId.trim().replace(/\s+/g, '');
    const clientSecret = config.paypal.clientSecret.trim().replace(/\s+/g, '');
    
    // Validate credential format
    if (clientId.length < 20 || clientSecret.length < 20) {
      console.error("PayPal credentials appear to be invalid (too short)");
    } else {
      paypal.configure({
        mode: config.paypal.mode as "sandbox" | "live",
        client_id: clientId,
        client_secret: clientSecret,
      });
      paypalConfigured = true;
      console.log("✅ PayPal configured successfully in", config.paypal.mode, "mode");
      console.log("PayPal Client ID (first 20 chars):", clientId.substring(0, 20) + "...");
      console.log("PayPal Client ID length:", clientId.length);
      console.log("PayPal Client Secret length:", clientSecret.length);
      
      // Verify mode matches credentials
      if (config.paypal.mode === "live") {
        console.log("⚠️  Using LIVE PayPal credentials - Real payments will be processed!");
      }
    }
  } catch (error) {
    console.error("Failed to configure PayPal:", error);
  }
} else {
  console.warn("PayPal credentials not found in environment variables");
  console.warn("Client ID:", config.paypal.clientId ? "SET" : "NOT SET");
  console.warn("Client Secret:", config.paypal.clientSecret ? "SET" : "NOT SET");
}

export interface CreateStripePaymentIntentDto {
  amount: number; // Amount in cents
  currency?: string;
  userId: string;
  userEmail: string;
  orderId?: string;
  metadata?: Record<string, string>;
}

export interface CreatePayPalPaymentDto {
  amount: number; // Amount in dollars
  currency?: string;
  userId: string;
  userEmail: string;
  orderId?: string;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  clientSecret?: string;
  approvalUrl?: string;
  error?: string;
}

class PaymentService {
  /**
   * Create Stripe Payment Intent
   */
  async createStripePaymentIntent(
    data: CreateStripePaymentIntentDto
  ): Promise<PaymentResult> {
    if (!stripe) {
      throw new AppError("Stripe is not configured", 500);
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency || "usd",
        metadata: {
          userId: data.userId,
          userEmail: data.userEmail,
          orderId: data.orderId || "",
          ...data.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        paymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
      };
    } catch (error: any) {
      console.error("Stripe payment intent creation error:", error);
      throw new AppError(
        error.message || "Failed to create payment intent",
        500
      );
    }
  }

  /**
   * Verify Stripe Payment Intent
   */
  async verifyStripePayment(paymentIntentId: string): Promise<boolean> {
    if (!stripe) {
      throw new AppError("Stripe is not configured", 500);
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      return paymentIntent.status === "succeeded";
    } catch (error: any) {
      console.error("Stripe payment verification error:", error);
      return false;
    }
  }

  /**
   * Create PayPal Payment
   */
  async createPayPalPayment(
    data: CreatePayPalPaymentDto
  ): Promise<PaymentResult> {
    if (!config.paypal.clientId || !config.paypal.clientSecret) {
      throw new AppError("PayPal is not configured. Please check your PayPal credentials in .env file", 500);
    }

    if (!paypalConfigured) {
      throw new AppError("PayPal SDK is not initialized. Please check your PayPal credentials", 500);
    }

    return new Promise((resolve, reject) => {
      const payment = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: `${config.app.frontendUrl}/checkout/payment-success?payment_method=paypal`,
          cancel_url: `${config.app.frontendUrl}/checkout?canceled=true`,
        },
        transactions: [
          {
            amount: {
              total: data.amount.toFixed(2),
              currency: data.currency || "USD",
            },
            description: data.description || "Order payment",
            custom: data.orderId || "",
            item_list: {
              items: [
                {
                  name: "Order Payment",
                  sku: data.orderId || "order",
                  price: data.amount.toFixed(2),
                  currency: data.currency || "USD",
                  quantity: 1,
                },
              ],
            },
          },
        ],
      };

      // Debug: Log configuration (without exposing secrets)
      console.log("PayPal Payment Request:", {
        mode: config.paypal.mode,
        clientIdLength: config.paypal.clientId?.length || 0,
        clientSecretLength: config.paypal.clientSecret?.length || 0,
        amount: data.amount,
        currency: data.currency,
      });

      paypal.payment.create(payment, (error: any, payment: any) => {
        if (error) {
          console.error("PayPal payment creation error:", JSON.stringify(error, null, 2));
          console.error("Error details:", {
            response: error.response,
            httpStatusCode: error.httpStatusCode,
            message: error.message,
            error_description: error.response?.error_description,
          });
          
          // Handle 401 specifically - Authentication failed
          if (error.httpStatusCode === 401 || error.response?.error === "invalid_client") {
            const errorMsg = error.response?.error_description || error.message || "PayPal authentication failed";
            console.error("PayPal 401 Error - Possible causes:");
            console.error("1. Invalid Client ID or Secret");
            console.error("2. Credentials don't match the mode (sandbox/live)");
            console.error("3. Credentials may have expired or been revoked");
            console.error("4. Check PayPal Developer Dashboard for correct credentials");
            
            reject(
              new AppError(
                `PayPal authentication failed: ${errorMsg}. Please verify your PayPal credentials in the .env file match your PayPal Developer Dashboard.`,
                401
              )
            );
            return;
          }
          
          reject(
            new AppError(
              error.message || error.response?.error_description || "Failed to create PayPal payment",
              error.httpStatusCode || 500
            )
          );
          return;
        }

        if (!payment || !payment.links) {
          reject(new AppError("Invalid PayPal payment response", 500));
          return;
        }

        const approvalUrl = payment.links.find(
          (link: any) => link.rel === "approval_url"
        );

        if (!approvalUrl) {
          reject(new AppError("PayPal approval URL not found", 500));
          return;
        }

        resolve({
          success: true,
          paymentId: payment.id,
          approvalUrl: approvalUrl.href,
        });
      });
    });
  }

  /**
   * Execute PayPal Payment
   */
  async executePayPalPayment(
    paymentId: string,
    payerId: string
  ): Promise<PaymentResult> {
    if (!config.paypal.clientId || !config.paypal.clientSecret) {
      throw new AppError("PayPal is not configured", 500);
    }

    return new Promise((resolve, reject) => {
      const execute_payment_json = {
        payer_id: payerId,
      };

      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        (error: any, payment: any) => {
          if (error) {
            console.error("PayPal payment execution error:", error);
            reject(
              new AppError(
                error.message || "Failed to execute PayPal payment",
                500
              )
            );
            return;
          }

          if (payment.state === "approved") {
            resolve({
              success: true,
              paymentId: payment.id,
            });
          } else {
            reject(new AppError("Payment was not approved", 400));
          }
        }
      );
    });
  }

  /**
   * Get Stripe Publishable Key
   */
  getStripePublishableKey(): string {
    return config.stripe.publishableKey || "";
  }
}

export const paymentService = new PaymentService();

