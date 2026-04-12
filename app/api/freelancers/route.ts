import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { handleApiError } from '@/lib/auth-middleware'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { rateLimit, API_RATE_LIMIT } from '@/lib/rate-limit'

// Force dynamic rendering - always get fresh data from DB
export const dynamic = 'force-dynamic'

/**
 * GET /api/freelancers
 * ALTFaze: Discover available freelancers (PUBLIC - no auth required)
 * 
 * Query params:
 * - search: string (search by name or skills)
 * - skill: string (filter by single skill)
 * - minRate: number (minimum hourly rate)
 * - maxRate: number (maximum hourly rate)
 * - minRating: number (minimum rating 0-5)
 * - limit: 1-100 (default: 20)
 * - page: >= 1 (default: 1)
 * - sort: 'rating' | 'rate' | 'recent' (default: 'rating')
 */
export async function GET(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const skill = searchParams.get('skill')
    const minRate = searchParams.get('minRate') ? parseFloat(searchParams.get('minRate')!) : 0
    const maxRate = searchParams.get('maxRate') ? parseFloat(searchParams.get('maxRate')!) : 10000
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : 0
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const offset = (page - 1) * limit
    const sort = searchParams.get('sort') || 'rating'

    // Build where clause
    let where: any = {
      role: 'FREELANCER',
      freelancer: {
        isNot: null,
      },
    }

    // Search by name or bio/title
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { freelancer: { bio: { contains: search, mode: 'insensitive' } } },
        { freelancer: { title: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Filter by skill
    if (skill) {
      where.freelancer = {
        ...where.freelancer,
        skills: {
          hasSome: [skill],
        },
      }
    }

    // Filter by rating
    if (minRating > 0) {
      where.freelancer = {
        ...where.freelancer,
        rating: {
          gte: minRating,
        },
      }
    }

    // Filter by hourly rate
    if (maxRate < 10000 || minRate > 0) {
      where.freelancer = {
        ...where.freelancer,
        hourlyRate: {
          gte: minRate,
          lte: maxRate,
        },
      }
    }

    // Build order by
    let orderBy: any = { freelancer: { rating: 'desc' } }
    if (sort === 'rate') {
      orderBy = { freelancer: { hourlyRate: 'asc' } }
    } else if (sort === 'recent') {
      orderBy = { createdAt: 'desc' }
    }

    // Fetch freelancers
    const [freelancers, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          freelancer: {
            select: {
              id: true,
              title: true,
              bio: true,
              skills: true,
              hourlyRate: true,
              rating: true,
              reviewCount: true,
              portfolio: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      db.user.count({ where }),
    ])

    return successResponse(
      {
        freelancers: freelancers.map((f) => ({
          id: f.id,
          name: f.name,
          email: f.email,
          image: f.image,
          title: f.freelancer?.title,
          bio: f.freelancer?.bio,
          skills: f.freelancer?.skills || [],
          hourlyRate: f.freelancer?.hourlyRate || 0,
          rating: f.freelancer?.rating || 0,
          reviewCount: f.freelancer?.reviewCount || 0,
          portfolio: f.freelancer?.portfolio || [],
          joinedAt: f.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: offset + limit < total,
        },
        filters: {
          search,
          skill,
          minRate,
          maxRate,
          minRating,
          sort,
        },
      },
      200,
      'Freelancers retrieved successfully'
    )
  } catch (error) {
    console.error('[FREELANCERS_GET_ERROR]', error)
    return handleApiError(error)
  }
}
