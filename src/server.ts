/**
 * Server Entry Point
 * Starts the Express server and connects to MongoDB
 */

import createApp from "./app";
import { connectDatabase } from "@/config/database";
import { config } from "@/config/env.config";
import { logger } from "@/utils/logger";

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start listening
    const PORT = config.port;
    const server = app.listen(PORT, () => {
      logger.success(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 GuestPost Backend API Server Started            ║
║                                                       ║
║   Environment: ${config.env.padEnd(37)}║
║   Port: ${String(PORT).padEnd(44)}║
║   API Version: ${config.apiVersion.padEnd(40)}║
║   URL: ${config.app.url.padEnd(44)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err: Error) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      logger.error("Shutting down server...");
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err: Error) => {
      logger.error(`Uncaught Exception: ${err.message}`);
      logger.error("Shutting down server...");
      process.exit(1);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        logger.info("Process terminated");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

// Create Express app for Vercel
const app = createApp();

// Start the server only if not in Vercel environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

// Export app for Vercel
export default app;
