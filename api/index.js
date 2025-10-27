/**
 * Vercel API Entry Point
 * Serverless function for Vercel deployment
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// Create Express app
const app = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN ||
      "http://localhost:3000,https://guestspost.netlify.app",
    credentials: true,
  })
);

// Body parsing middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Root route
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "GuestPost Backend API",
    version: "v1",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
  });
});

// Health check route
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// API routes placeholder
app.get("/api/v1/auth/test", (_req, res) => {
  res.json({
    success: true,
    message: "Auth API is working",
    timestamp: new Date().toISOString(),
  });
});

// Export as Vercel serverless function
module.exports = app;
