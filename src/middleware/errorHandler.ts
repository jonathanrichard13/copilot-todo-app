import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse } from "../models/ApiResponse";

/**
 * Error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);

  const errorResponse: ApiErrorResponse = {
    success: false,
    message: error.message || 'Internal server error',
    timestamp: new Date(),
  };

  // Set status code based on error type
  let statusCode = 500;
  
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.errorCode = 'VALIDATION_ERROR';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    errorResponse.errorCode = 'NOT_FOUND';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    errorResponse.errorCode = 'UNAUTHORIZED';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    errorResponse.errorCode = 'FORBIDDEN';
  }

  res.status(statusCode).json(errorResponse);
};
