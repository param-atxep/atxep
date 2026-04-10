import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, handleApiError } from '@/lib/auth-middleware'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { rateLimit, API_RATE_LIMIT } from '@/lib/rate-limit'

/**
 * GET /api/templates
 * Fetch templates (public or user's private templates)
 * 
 * Query params:
 * - search: string (search by name or description)
 * - category: string (filter by category)
 * - sort: 'popular' | 'newest' | 'price-low' | 'price-high' (default: 'popular')
 * - limit: 1-100 (default: 20)
 * - page: >= 1 (default: 1)
 * - my: 'true' (if set, only return user's templates, requires auth)
 */
export async function GET(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'popular'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const offset = (page - 1) * limit
    const myTemplates = searchParams.get('my') === 'true'

    // Check auth if requesting personal templates
    let userId: string | undefined
    if (myTemplates) {
      try {
        const auth = await requireAuth(req)
        userId = auth.userId
      } catch {
        return errorResponse(401, 'Authentication required to view personal templates')
      }
    }

    // Build where clause
    let where: any = {}

    if (myTemplates && userId) {
      where.uploaderId = userId
    } else {
      where.isPublic = true // Only show public templates
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = category
    }

    // Build order by
    let orderBy: any = { downloads: 'desc' }
    if (sort === 'newest') {
      orderBy = { createdAt: 'desc' }
    } else if (sort === 'price-low') {
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
          name: true,
          description: true,
          category: true,
          price: true,
          image: true,
          rating: true,
          downloads: true,
          features: true,
          uploader: {
            select: { id: true, name: true, image: true },
          },
          createdAt: true,
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
          name: t.name,
          description: t.description,
          category: t.category,
          price: t.price?.toNumber() || 0,
          image: t.image,
          rating: t.rating,
          downloads: t.downloads,
          features: t.features || [],
          uploader: t.uploader,
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
  } catch (error) {
    console.error('[TEMPLATES_GET_ERROR]', error)
    return handleApiError(error)
  }
}

/**
 * POST /api/templates
 * Upload a new template (requires authentication)
 */
export async function POST(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const { userId } = await requireAuth(req)
    const body = await req.json()

    // Validation
    const { name, description, category, price, image, features, githubUrl, previewUrl, isPublic } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return errorResponse(400, 'Template name is required')
    }

    if (!category || typeof category !== 'string') {
      return errorResponse(400, 'Category is required')
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return errorResponse(400, 'Price must be a non-negative number')
    }

    // Create template
    const template = await db.template.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        category,
        price: price ? parseFloat(price) : 0,
        image: image || null,
        features: features || [],
        githubUrl: githubUrl || null,
        previewUrl: previewUrl || null,
        isPublic: isPublic !== false,
        uploaderId: userId,
        rating: 5,
        downloads: 0,
      },
      include: {
        uploader: { select: { id: true, name: true, image: true } },
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        action: 'TEMPLATE_UPLOADED',
        description: `Uploaded template: ${name}`,
        metadata: { templateId: template.id },
      },
    }).catch((err: any) => console.error('[ACTIVITY_LOG_ERROR]', err))

    return successResponse(
      {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        price: template.price?.toNumber() || 0,
        image: template.image,
        isPublic: template.isPublic,
        uploader: template.uploader,
        createdAt: template.createdAt,
      },
      201,
      'Template uploaded successfully'
    )
  } catch (error) {
    console.error('[TEMPLATES_POST_ERROR]', error)
    return handleApiError(error)
  }
}
      }
    } catch (err) {
      console.error('[ACTIVITY_LOG_ERROR]', err)
    }

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
          hasMore: offset + limit < total,
        },
      },
      200,
      'Templates retrieved successfully'
    )
  } catch (error) {
    console.error('[TEMPLATES_GET_ERROR]', error)
    return handleApiError(error)
  }
}

/**
 * POST /api/templates
 * Create new template (FREELANCER only)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthWithRole(req, 'FREELANCER')
    const { userId } = auth

    const body = await req.json()
    const { title, description, category, price, features, image } = body

    // Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new ValidationError('Valid title is required')
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      throw new ValidationError('Valid description is required')
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      throw new ValidationError('Valid category is required')
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      throw new ValidationError('Valid price is required and must be greater than 0')
    }

    const priceNum = parseFloat(price.toString())
    if (priceNum > 999999999) {
      throw new ValidationError('Price exceeds maximum limit')
    }

    // Create template
    const template = await db.template.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        price: priceNum,
        image: image || null,
        features: Array.isArray(features) ? features.filter(f => f) : [],
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
      'Template created successfully'
    )
  } catch (error) {
    console.error('[TEMPLATES_POST_ERROR]', error)
    return handleApiError(error)
  }
}

/**
 * PUT /api/templates/:id/purchase
 * Purchase a template (CLIENT only)
 */
export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuthWithRole(req, 'CLIENT')
    const { userId } = auth

    const body = await req.json()
    const { templateId } = body

    if (!templateId || typeof templateId !== 'string') {
      throw new ValidationError('Valid templateId is required')
    }

    // Get template
    const template = await db.template.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      throw new ValidationError('Template not found')
    }

    const price = template.price?.toNumber() || 0

    // Check client balance
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new ValidationError('User not found')
    }

    const balance = user.walletBalance?.toNumber() || 0
    if (balance < price) {
      throw new ValidationError(
        `Insufficient balance. Need ₹${price}, but you have ₹${balance}`
      )
    }

    // Process purchase with transaction
    await db.transaction.create({
      data: {
        userId: userId,
        type: 'PAYMENT',
        amount: price,
        status: 'COMPLETED',
        description: `Purchased template: ${template.title}`,
        templateId: templateId,
        senderId: userId,
        metadata: {
          templateTitle: template.title,
          templateCategory: template.category,
        },
      },
    })

    // Update wallet
    await db.user.update({
      where: { id: userId },
      data: {
        walletBalance: { decrement: price },
        totalSpent: { increment: price },
      },
    })

    // Log purchase activity (non-blocking)
    try {
      await logTemplatePurchase(userId, templateId, price, template.title).catch(err =>
        console.error('[ACTIVITY_LOG_ERROR]', err)
      )
    } catch (err) {
      console.error('[ACTIVITY_LOG_ERROR]', err)
    }

    return successResponse(
      {
        templateId,
        price,
        title: template.title,
      },
      200,
      'Template purchased successfully'
    )
  } catch (error) {
    console.error('[TEMPLATES_PUT_ERROR]', error)
    return handleApiError(error)
  }
}
