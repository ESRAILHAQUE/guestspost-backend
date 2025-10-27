/**
 * Error Handling Middleware
 * Global error handler for all errors thrown in the application
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";
import { logger } from "@/utils/logger";
import { config } from "@/config/env.config";
import mongoose from "mongoose";

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // Log error
  logger.error(`Error: ${err.message}`);
  if (config.isDevelopment) {
    logger.error(err.stack || "");
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = new AppError(message, 409);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values((err as mongoose.Error.ValidationError).errors)
      .map((e) => e.message);
    const message = errors.join(", ");
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    error = new AppError(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired. Please log in again.";
    error = new AppError(message, 401);
  }

  // Get status code and message
  const statusCode = (error as AppError).statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(config.isDevelopment && {
      error: {
        stack: err.stack,
        details: err,
      },
    }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};

/**
 * Not Found Handler - Catch 404 errors
 */
export const notFound = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const message = `Route ${req.originalUrl} not found`;
  res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};

