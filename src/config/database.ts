/**
 * Database Configuration
 * Handles MongoDB connection with Mongoose
 */

import mongoose from "mongoose";
import { logger } from "@/utils/logger";
import { config } from "./env.config";

/**
 * Connect to MongoDB database
 * @returns Promise<void>
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.database.uri, {
      // Mongoose 6+ doesn't need these options, but keeping for backward compatibility
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      logger.error(`MongoDB connection error: ${error.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    logger.error(`Database connection failed: ${error}`);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * @returns Promise<void>
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  } catch (error) {
    logger.error(`Error closing database connection: ${error}`);
  }
};
