/**
 * Environment Configuration
 * Centralized configuration for all environment variables
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Validate required environment variables
 */
const requiredEnvVars = ["NODE_ENV", "PORT", "MONGODB_URI", "JWT_SECRET"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

/**
 * Configuration object with all environment variables
 */
export const config = {
  // Server Configuration
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  apiVersion: process.env.API_VERSION || "v1",

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI as string,
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as string,
    refreshSecret: (process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_SECRET) as string,
    refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "30d") as string,
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
    credentials: true,
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    user: process.env.EMAIL_USER || "",
    password: process.env.EMAIL_PASSWORD || "",
    from: process.env.EMAIL_FROM || "noreply@guestpostnow.io",
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10), // 5MB default
    uploadPath: process.env.UPLOAD_PATH || "./uploads",
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },

  // Admin Configuration
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@guestpostnow.io",
    password: process.env.ADMIN_PASSWORD || "Admin@123456",
  },

  // Application URLs
  app: {
    url: process.env.APP_URL || "http://localhost:5000",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  },

  // Security
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },

  // Helper flags
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};

export default config;
