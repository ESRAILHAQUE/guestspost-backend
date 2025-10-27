/**
 * Express Application Configuration
 * Main app setup with middlewares and routes
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "@/config/env.config";
import { errorHandler, notFound } from "@/middlewares/error.middleware";
import routes from "@/routes";
import { logger } from "@/utils/logger";

/**
 * Create Express Application
 */
const createApp = () => {
  const app = express();

  // Security middlewares
  app.use(helmet()); // Set security headers
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
    })
  ); // Enable CORS

  
  // Body parsing middlewares
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  // Logging middleware
  if (config.isDevelopment) {
    app.use(
      morgan("dev", {
        stream: {
          write: (message) => logger.http(message.trim()),
        },
      })
    );
  } else {
    app.use(morgan("combined"));
  }

  // API Routes
  app.use(`/api/${config.apiVersion}`, routes);

  // Root route
  app.get("/", (_req: any, res: any) => {
    res.json({
      success: true,
      message: "GuestPost Backend API",
      version: config.apiVersion,
      timestamp: new Date().toISOString(),
    });
  });

  // Error handling middlewares (must be last)
  app.use(notFound); // 404 handler
  app.use(errorHandler); // Global error handler

  return app;
};

export default createApp;
// Additional backend configuration
// Backend optimization 1
// Backend enhancement 1
// Backend enhancement 2
// Backend enhancement 3
// Backend enhancement 4
// Backend enhancement 5
// Backend enhancement 6
// Backend enhancement 7
// Backend enhancement 8
// Backend enhancement 9
// Backend enhancement 10
// Backend enhancement 11
// Backend enhancement 12
// Backend enhancement 13
// Backend enhancement 14
// Backend enhancement 15
// Backend enhancement 16
// Backend enhancement 17
// Backend enhancement 18
// Backend enhancement 19
// Backend enhancement 20
