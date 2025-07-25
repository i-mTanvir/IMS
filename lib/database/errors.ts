// Database error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends DatabaseError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR');
  }
}

export class PermissionError extends DatabaseError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'PERMISSION_DENIED');
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends DatabaseError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND');
  }
}

// Error handler for Supabase errors
export const handleSupabaseError = (error: any): never => {
  // Supabase specific error handling
  if (error.code === 'PGRST116') {
    throw new NotFoundError();
  }
  
  if (error.code === '23505') {
    throw new ValidationError('Duplicate entry', error.details);
  }
  
  if (error.code === '42501') {
    throw new PermissionError();
  }
  
  // RLS policy violations
  if (error.message?.includes('row-level security')) {
    throw new PermissionError('Access denied by security policy');
  }
  
  // Authentication errors
  if (error.message?.includes('JWT')) {
    throw new AuthenticationError('Invalid or expired token');
  }
  
  // Generic database error
  throw new DatabaseError(error.message || 'Database operation failed', 'DATABASE_ERROR', error);
};