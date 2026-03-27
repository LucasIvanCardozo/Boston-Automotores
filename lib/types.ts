export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
  error?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export function createSuccessResult<T>(data: T): ActionResult<T> {
  return {
    success: true,
    data,
  };
}

export function createErrorResult(error: string, errors?: Record<string, string[]>): ActionResult {
  return {
    success: false,
    error,
    ...(errors && { errors }),
  };
}

export function createPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
