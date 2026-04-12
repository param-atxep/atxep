import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { errorResponse } from './api-utils'

export class UnauthorizedError extends Error {
  status = 401
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export async function getAuthenticatedUserId(req?: NextRequest): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    return session?.user?.id || null
  } catch (error) {
    return null
  }
}

export async function requireAuth(req?: NextRequest): Promise<{ userId: string }> {
  const userId = await getAuthenticatedUserId(req)
  if (!userId) {
    throw new UnauthorizedError('You must be logged in to access this resource')
  }
  return { userId }
}

export async function requireAuthWithRole(
  req?: NextRequest,
  requiredRole?: 'CLIENT' | 'FREELANCER'
): Promise<{ userId: string; role: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new UnauthorizedError('You must be logged in to access this resource')
    }

    if (requiredRole && (session.user as any).role !== requiredRole) {
      throw new UnauthorizedError(`This resource requires ${requiredRole} role`)
    }

    return {
      userId: session.user.id,
      role: (session.user as any).role || 'CLIENT',
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error
    throw new UnauthorizedError('Authentication failed')
  }
}

export function handleApiError(error: any) {
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
    return errorResponse(500, error.message)
  }
  return errorResponse(500, 'An internal error occurred')
}
