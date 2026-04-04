import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
<<<<<<< HEAD
import { UnauthorizedError, successResponse, errorResponse } from './api'
=======
import { UnauthorizedError, ForbiddenError, errorResponse } from './api-utils'
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)

/**
 * Get authenticated user session from request
 * Used in API routes to verify user is logged in
 */
export async function getAuthenticatedUserId(req?: NextRequest): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    return session?.user?.id || null
  } catch (error) {
<<<<<<< HEAD
=======
    console.error('[AUTH_MIDDLEWARE] Error getting session:', error)
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    return null
  }
}

/**
 * Verify user is authenticated
 * Used as middleware in API routes
 */
<<<<<<< HEAD
export async function requireAuth(req?: NextRequest): Promise<{ userId: string }> {
  const userId = await getAuthenticatedUserId(req)
  if (!userId) {
    throw new UnauthorizedError('You must be logged in to access this resource')
  }
  return { userId }
=======
export async function requireAuth(req?: NextRequest): Promise<{ userId: string; email: string; role: string }> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      throw new UnauthorizedError('You must be logged in to access this resource')
    }

    return {
      userId: session.user.id,
      email: session.user.email || '',
      role: (session.user as any).role || 'CLIENT',
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error
    throw new UnauthorizedError('Authentication failed')
  }
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
}

/**
 * Verify user is authenticated and has specific role
 */
export async function requireAuthWithRole(
  req?: NextRequest,
  requiredRole?: 'CLIENT' | 'FREELANCER'
<<<<<<< HEAD
): Promise<{ userId: string; role: string }> {
  try {
    const session = await getServerSession(authOptions)
=======
): Promise<{ userId: string; email: string; role: string }> {
  try {
    const session = await getServerSession(authOptions)
    
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    if (!session?.user?.id) {
      throw new UnauthorizedError('You must be logged in to access this resource')
    }

<<<<<<< HEAD
    if (requiredRole && session.user.role !== requiredRole) {
      throw new UnauthorizedError(`This resource requires ${requiredRole} role`)
=======
    const userRole = (session.user as any).role || 'CLIENT'

    if (requiredRole && userRole !== requiredRole) {
      throw new ForbiddenError(`This resource requires ${requiredRole} role. Your role: ${userRole}`)
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    }

    return {
      userId: session.user.id,
<<<<<<< HEAD
      role: session.user.role || 'CLIENT',
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error
=======
      email: session.user.email || '',
      role: userRole,
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error
    if (error instanceof ForbiddenError) throw error
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    throw new UnauthorizedError('Authentication failed')
  }
}

/**
 * Middleware wrapper for API routes that require authentication
 * Usage in API route:
 * export async function POST(req: NextRequest) {
 *   try {
 *     const { userId } = await requireAuth(req)
 *     // Your code here
 *   } catch (error) {
 *     return handleApiError(error)
 *   }
 * }
 */
export function handleApiError(error: any) {
<<<<<<< HEAD
  if (error instanceof UnauthorizedError || error.status === 401) {
    return errorResponse(401, error.message || 'Unauthorized')
  }
  if (error.status === 404) {
    return errorResponse(404, error.message || 'Not found')
  }
  if (error.status === 400) {
    return errorResponse(400, error.message || 'Bad request')
  }
  if (error.message) {
=======
  console.error('[API_ERROR]', {
    name: error?.name || 'Unknown',
    message: error?.message,
    status: error?.status,
  })

  if (error instanceof UnauthorizedError) {
    return errorResponse(401, error.message || 'Unauthorized')
  }

  if (error instanceof ForbiddenError) {
    return errorResponse(403, error.message || 'Forbidden')
  }

  if (error.name === 'ValidationError' || error.message?.includes('Valid')) {
    return errorResponse(400, error.message || 'Validation error')
  }

  if (error.status === 404) {
    return errorResponse(404, error.message || 'Not found')
  }

  if (error.status === 400) {
    return errorResponse(400, error.message || 'Bad request')
  }

  if (error.status === 409) {
    return errorResponse(409, error.message || 'Conflict')
  }

  // Default to 500 error
  const message = process.env.NODE_ENV === 'development' 
    ? error?.message || 'An error occurred'
    : 'An error occurred. Please try again.'

  return errorResponse(500, message)
}

>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    return errorResponse(500, error.message)
  }
  return errorResponse(500, 'An internal error occurred')
}
