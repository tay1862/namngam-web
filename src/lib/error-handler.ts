// Centralized error handling for NAMNGAM

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    
    // Only capture stack trace in development
    // @ts-ignore
    if (typeof window === 'undefined' && process?.env?.NODE_ENV !== 'production') {
      (Error as any).captureStackTrace?.(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, true, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

// Error response formatter
export function formatErrorResponse(error: any) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  // Handle Prisma errors
  if (error.code?.startsWith('P')) {
    return formatPrismaError(error);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return {
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
      statusCode: 401,
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
      statusCode: 401,
    };
  }

  // Default error
  console.error('Unhandled error:', error);
  return {
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
}

// Prisma error formatter
function formatPrismaError(error: any) {
  switch (error.code) {
    case 'P2002':
      return {
        success: false,
        error: 'Resource already exists',
        code: 'DUPLICATE_RESOURCE',
        statusCode: 409,
      };
    case 'P2025':
      return {
        success: false,
        error: 'Resource not found',
        code: 'NOT_FOUND',
        statusCode: 404,
      };
    case 'P2003':
      return {
        success: false,
        error: 'Foreign key constraint violation',
        code: 'FOREIGN_KEY_VIOLATION',
        statusCode: 400,
      };
    default:
      return {
        success: false,
        error: 'Database error',
        code: 'DATABASE_ERROR',
        statusCode: 500,
      };
  }
}

// Async error wrapper for API routes
export function asyncHandler(fn: Function) {
  return (req: any, res: any, next?: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Validation helper
export function validateRequired(data: any, fields: string[]) {
  const missing: string[] = [];
  
  for (const field of fields) {
    if (!data[field] || data[field] === '') {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
  
  return true;
}

// Email validator
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validator
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { valid: errors.length === 0, errors };
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
}

// Logger for errors
export function logError(error: any, context?: string) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message: error.message || error,
    stack: error.stack,
    context,
    ...(error instanceof AppError && {
      code: error.code,
      statusCode: error.statusCode,
    }),
  };
  
  console.error('ERROR:', JSON.stringify(logEntry, null, 2));
  
  // In production, you would send this to a logging service
  // like Sentry, LogRocket, or similar
}