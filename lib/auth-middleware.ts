import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

/**
 * Get authenticated user session from request
 * Used in API routes to verify user is logged in
 */
export async function getAuthenticatedUserId(req?: NextRequest): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    return session?.user?.id || null
  } catch (error) {
    return null
  }
}

/**
 * Verify user is authenticated
 * Used as middleware in API routes
 */
}

/**
 * Verify user is authenticated and has specific role
 */
export async function requireAuthWithRole(
  req?: NextRequest,
  requiredRole?: 'CLIENT' | 'FREELANCER'
    if (!session?.user?.id) {
      throw new UnauthorizedError('You must be logged in to access this resource')
    }

    }

    return {
      userId: session.user.id,
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
    return errorResponse(500, error.message)
  }
  return errorResponse(500, 'An internal error occurred')
}

