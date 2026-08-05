export class AppError extends Error {
  public readonly statusCode?: number;
  public readonly originalError?: unknown;

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.originalError = originalError;

    // Restore prototype chain for custom Error subclass in TS/ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SupabaseError extends AppError {
  public readonly code?: string;

  constructor(message: string, code?: string, statusCode?: number, originalError?: unknown) {
    super(message, statusCode, originalError);
    this.name = 'SupabaseError';
    this.code = code;
    Object.setPrototypeOf(this, SupabaseError.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network failure. Please check your internet connection.', originalError?: unknown) {
    super(message, 0, originalError);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class UnknownError extends AppError {
  constructor(message: string = 'An unknown error occurred.', originalError?: unknown) {
    super(message, 500, originalError);
    this.name = 'UnknownError';
    Object.setPrototypeOf(this, UnknownError.prototype);
  }
}

/**
 * Standard utility to handle and map caught exceptions to structured AppErrors.
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    if (typeof err.message === 'string') {
      const code = typeof err.code === 'string' ? err.code : undefined;
      const status = typeof err.status === 'number' ? err.status : undefined;
      return new SupabaseError(err.message, code, status, error);
    }
  }

  if (error instanceof Error) {
    return new AppError(error.message, undefined, error);
  }

  return new UnknownError(String(error), error);
}
