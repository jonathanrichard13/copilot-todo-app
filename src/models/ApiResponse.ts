/**
 * Standard API response format for successful operations
 */
export interface ApiResponse<T = any> {
  /** Indicates if the operation was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Optional success message */
  message?: string;
  /** Timestamp of the response */
  timestamp: Date;
}

/**
 * Standard API response format for error operations
 */
export interface ApiErrorResponse {
  /** Indicates if the operation was successful */
  success: false;
  /** Error message */
  message: string;
  /** Error code */
  errorCode?: string;
  /** Detailed error information */
  details?: any;
  /** Timestamp of the response */
  timestamp: Date;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there's a next page */
  hasNext: boolean;
  /** Whether there's a previous page */
  hasPrev: boolean;
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** Pagination metadata */
  pagination: PaginationMeta;
}
