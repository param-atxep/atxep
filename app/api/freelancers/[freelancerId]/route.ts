import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { handleApiError } from '@/lib/auth-middleware'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { rateLimit, API_RATE_LIMIT } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/freelancers/:freelancerId
 * Get detailed freelancer profile with projects and reviews
 */
export async function GET(req: NextRequest, { params }: { params: { freelancerId: string } }) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const { freelancerId } = params

    if (!freelancerId || typeof freelancerId !== 'string') {
      return errorResponse(400, 'Valid freelancerId is required')
    }

    // Get freelancer profile
    const user = await db.user.findUnique({
      where: { id: freelancerId },
      include: {
        freelancer: {
          select: {
            id: true,
            title: true,
            bio: true,
            skills: true,
            portfolio: true,
            hourlyRate: true,
            rating: true,
            reviewCount: true,
          },
        },
        projectsCreated: {
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 6,
        },
      },
    })

    if (!user || user.role !== 'FREELANCER') {
      return errorResponse(404, 'Freelancer not found')
    }

    // Get sent requests count (active projects)
    const activeProjects = await db.request.count({
      where: {
        receiverId: freelancerId,
        status: 'ACCEPTED',
      },
    })

    // Get completed projects count
    const completedProjects = await db.request.count({
      where: {
        receiverId: freelancerId,
        status: 'COMPLETED',
      },
    })

    return successResponse(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        title: user.freelancer?.title,
        bio: user.freelancer?.bio,
        skills: user.freelancer?.skills || [],
        portfolio: user.freelancer?.portfolio || [],
        hourlyRate: user.freelancer?.hourlyRate || 0,
        rating: user.freelancer?.rating || 0,
        reviewCount: user.freelancer?.reviewCount || 0,
        projects: [],
        stats: {
          activeProjects,
          completedProjects,
          joinedAt: user.createdAt,
        },
      },
      200,
      'Freelancer profile retrieved successfully'
    )
  } catch (error) {
    console.error('[FREELANCER_PROFILE_ERROR]', error)
    return handleApiError(error)
  }
}
