/**
 * Test PayPal Credentials
 * Run this script to verify PayPal credentials are correct
 * Usage: pnpm ts-node -r tsconfig-paths/register src/scripts/test-paypal-credentials.ts
 */

import * as paypal from "paypal-rest-sdk";
import { config } from "@/config/env.config";

console.log("🔍 Testing PayPal Credentials...\n");

// Check if credentials are set
if (!config.paypal.clientId || !config.paypal.clientSecret) {
  console.error("❌ PayPal credentials not found in environment variables");
  console.log("Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env file");
  process.exit(1);
}

console.log("✅ Credentials found in .env:");
console.log(`   Mode: ${config.paypal.mode}`);
console.log(`   Client ID length: ${config.paypal.clientId.length}`);
console.log(`   Client Secret length: ${config.paypal.clientSecret.length}`);
console.log(`   Client ID preview: ${config.paypal.clientId.substring(0, 20)}...\n`);

// Configure PayPal
try {
  paypal.configure({
    mode: config.paypal.mode as "sandbox" | "live",
    client_id: config.paypal.clientId.trim(),
    client_secret: config.paypal.clientSecret.trim(),
  });
  console.log("✅ PayPal SDK configured\n");
} catch (error) {
  console.error("❌ Failed to configure PayPal SDK:", error);
  process.exit(1);
}

// Test with a minimal payment creation
console.log("🧪 Testing payment creation...\n");

const testPayment = {
  intent: "sale",
  payer: {
    payment_method: "paypal",
  },
  redirect_urls: {
    return_url: "http://localhost:3000/test",
    cancel_url: "http://localhost:3000/test",
  },
  transactions: [
    {
      amount: {
        total: "1.00",
        currency: "USD",
      },
      description: "Test payment",
    },
  ],
};

paypal.payment.create(testPayment, (error: any, payment: any) => {
  if (error) {
    console.error("❌ PayPal API Test Failed!\n");
    console.error("Error:", JSON.stringify(error, null, 2));
    
    if (error.httpStatusCode === 401) {
      console.error("\n🔴 Authentication Failed!");
      console.error("\nPossible solutions:");
      console.error("1. Go to https://developer.paypal.com/dashboard/");
      console.error("2. Login and navigate to 'Apps & Credentials'");
      console.error("3. Select your Sandbox app (or create a new one)");
      console.error("4. Copy the Client ID and Secret");
      console.error("5. Update your .env file:");
      console.error("   PAYPAL_CLIENT_ID=your_client_id_here");
      console.error("   PAYPAL_CLIENT_SECRET=your_secret_here");
      console.error("   PAYPAL_MODE=sandbox");
      console.error("\n6. Restart your backend server");
    }
    process.exit(1);
  } else {
    console.log("✅ PayPal API Test Successful!\n");
    console.log("Payment ID:", payment.id);
    console.log("Status:", payment.state);
    console.log("\n✅ Your PayPal credentials are valid!");
    process.exit(0);
  }
});

