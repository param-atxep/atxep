import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireAuthWithRole, handleApiError } from '@/lib/auth-middleware'
import { successResponse, errorResponse, ValidationError } from '@/lib/api-utils'
import { rateLimit } from '@/lib/rate-limit'
import { logTemplatePurchase } from '@/lib/activity'

// Force dynamic rendering - always get fresh data from DB
export const dynamic = 'force-dynamic'

/**
 * GET /api/templates
 * Fetch all templates with pagination and filtering
 * 
 * Query params:
 * - search: string (search by title or description)
 * - category: string (filter by category)
 * - sort: 'popular' | 'newest' | 'price-low' | 'price-high' (default: 'newest')
 * - limit: 1-100 (default: 20)
 * - page: >= 1 (default: 1)
 */
export async function GET(req: NextRequest) {
  try {
    const isRateLimited = !(await rateLimit(req, 'templates'))
    if (isRateLimited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'newest'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const offset = (page - 1) * limit

    // Build where clause
    let where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = category
    }

    // Build order by
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price-low') {
      orderBy = { price: 'asc' }
    } else if (sort === 'price-high') {
      orderBy = { price: 'desc' }
    }

    // Fetch templates
    const [templates, total] = await Promise.all([
      db.template.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          price: true,
          image: true,
          features: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      db.template.count({ where }),
    ])

    return successResponse(
      {
        templates: templates.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          category: t.category,
          price: t.price?.toNumber() || 0,
          image: t.image,
          features: t.features || [],
          createdAt: t.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: offset + limit < total,
        },
      },
      200,
      'Templates retrieved successfully'
    )
  } catch (error: any) {
    console.error('[TEMPLATES_GET_ERROR]', error)
    return handleApiError(error)
  }
}

/**
 * POST /api/templates
 * Upload a new template (requires FREELANCER role)
 */
export async function POST(req: NextRequest) {
  try {
    const isRateLimited = !(await rateLimit(req, 'templates'))
    if (isRateLimited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const auth = await requireAuthWithRole(req, 'FREELANCER')
    const { userId } = auth
    const body = await req.json()

    // Validation
    const { title, description, category, price, image, features } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new ValidationError('Template title is required')
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      throw new ValidationError('Template description is required')
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      throw new ValidationError('Template category is required')
    }

    if (price === undefined || price === null) {
      throw new ValidationError('Template price is required')
    }

    const priceNum = parseFloat(price.toString())
    if (isNaN(priceNum) || priceNum < 0) {
      throw new ValidationError('Price must be a valid non-negative number')
    }

    if (priceNum > 999999999) {
      throw new ValidationError('Price exceeds maximum limit (₹999,999,999)')
    }

    // Create template
    const template = await db.template.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        price: priceNum,
        image: image || null,
        features: Array.isArray(features) ? features.filter((f: any) => f && typeof f === 'string') : [],
      },
    })

    return successResponse(
      {
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        price: template.price?.toNumber() || 0,
        image: template.image,
        features: template.features,
        createdAt: template.createdAt,
      },
      201,
      'Template uploaded successfully'
    )
  } catch (error: any) {
    console.error('[TEMPLATES_POST_ERROR]', error)
    return handleApiError(error)
  }
}
