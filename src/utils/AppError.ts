/**
 * Custom Application Error Class
 * Extends the native Error class with additional properties for better error handling
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly path?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    path?: string
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.path = path;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly (for TypeScript)
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Convert error to JSON format
   */
  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(this.path && { path: this.path }),
    };
  }
}

/**
 * Predefined error classes for common HTTP errors
 */

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", path?: string) {
    super(message, 400, true, path);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", path?: string) {
    super(message, 401, true, path);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", path?: string) {
    super(message, 403, true, path);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", path?: string) {
    super(message, 404, true, path);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict", path?: string) {
    super(message, 409, true, path);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", path?: string) {
    super(message, 422, true, path);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error", path?: string) {
    super(message, 500, false, path);
  }
}
