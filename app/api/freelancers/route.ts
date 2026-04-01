import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, handleApiError } from '@/lib/auth-middleware'
import { successResponse, errorResponse } from '@/lib/api'

/**
 * GET /api/freelancers
 * Get freelancers list with search and filtering
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)

    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search')
    const skill = searchParams.get('skill')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : null
    const maxRate = searchParams.get('maxRate') ? parseFloat(searchParams.get('maxRate')!) : null

    // Build where clause
    let where: any = {
      freelancer: {
        isNot: null,
      },
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { freelancer: { bio: { contains: search, mode: 'insensitive' } } },
        { freelancer: { title: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (skill) {
      where.freelancer = {
        ...where.freelancer,
        skills: {
          has: skill,
        },
      }
    }

    if (minRating !== null) {
      where.freelancer = {
        ...where.freelancer,
        rating: {
          gte: minRating,
        },
      }
    }

    if (maxRate !== null) {
      where.freelancer = {
        ...where.freelancer,
        hourlyRate: {
          lte: maxRate,
        },
      }
    }

    const freelancers = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        freelancer: {
          select: {
            title: true,
            bio: true,
            skills: true,
            portfolio: true,
            hourlyRate: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
      orderBy: {
        freelancer: {
          rating: 'desc',
        },
      },
      take: limit,
      skip: offset,
    })

    const total = await db.user.count({ where })

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
          portfolio: f.freelancer?.portfolio,
          hourlyRate: f.freelancer?.hourlyRate?.toString(),
          rating: f.freelancer?.rating?.toString(),
          reviewCount: f.freelancer?.reviewCount,
        })),
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + limit < total,
        },
      },
      200,
      'Freelancers retrieved successfully'
    )
  } catch (error) {
    console.error('[FREELANCERS_ERROR]', error)
    return handleApiError(error)
  }
}
