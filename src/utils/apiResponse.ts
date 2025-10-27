/**
 * API Response Utility
 * Provides consistent response formatting for success and error responses
 */

import { Response } from "express";

export interface ApiResponseData<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code?: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

/**
 * API Response Handler
 */
export class ApiResponse {
  /**
   * Send success response
   */
  static success<T = any>(
    res: Response,
    data: T,
    message: string = "Request successful",
    statusCode: number = 200
  ): Response {
    const response: ApiResponseData<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created<T = any>(
    res: Response,
    data: T,
    message: string = "Resource created successfully"
  ): Response {
    return this.success(res, data, message, 201);
  }

  /**
   * Send no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = "An error occurred",
    statusCode: number = 500,
    errorCode?: string,
    errorDetails?: any,
    path?: string
  ): Response {
    const response: ApiResponseData = {
      success: false,
      message,
      error: {
        ...(errorCode && { code: errorCode }),
        ...(errorDetails && { details: errorDetails }),
      },
      timestamp: new Date().toISOString(),
      ...(path && { path }),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send bad request error (400)
   */
  static badRequest(
    res: Response,
    message: string = "Bad Request",
    errorDetails?: any
  ): Response {
    return this.error(res, message, 400, "BAD_REQUEST", errorDetails);
  }

  /**
   * Send unauthorized error (401)
   */
  static unauthorized(
    res: Response,
    message: string = "Unauthorized access"
  ): Response {
    return this.error(res, message, 401, "UNAUTHORIZED");
  }

  /**
   * Send forbidden error (403)
   */
  static forbidden(
    res: Response,
    message: string = "Access forbidden"
  ): Response {
    return this.error(res, message, 403, "FORBIDDEN");
  }

  /**
   * Send not found error (404)
   */
  static notFound(
    res: Response,
    message: string = "Resource not found"
  ): Response {
    return this.error(res, message, 404, "NOT_FOUND");
  }

  /**
   * Send conflict error (409)
   */
  static conflict(
    res: Response,
    message: string = "Resource conflict"
  ): Response {
    return this.error(res, message, 409, "CONFLICT");
  }

  /**
   * Send validation error (422)
   */
  static validationError(
    res: Response,
    message: string = "Validation failed",
    errorDetails?: any
  ): Response {
    return this.error(res, message, 422, "VALIDATION_ERROR", errorDetails);
  }

  /**
   * Send internal server error (500)
   */
  static internalError(
    res: Response,
    message: string = "Internal server error"
  ): Response {
    return this.error(res, message, 500, "INTERNAL_ERROR");
  }

  /**
   * Send paginated response
   */
  static paginated<T = any>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = "Request successful"
  ): Response {
    const totalPages = Math.ceil(total / limit);

    const response = {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  }
}
