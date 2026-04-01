import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuthWithRole, handleApiError } from '@/lib/auth-middleware'
import { successResponse, ValidationError } from '@/lib/api'
import { logTemplateView, logTemplatePurchase } from '@/lib/activity'

/**
 * GET /api/templates
 * Get templates (browse all or filter by category)
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuthWithRole(req)

    const searchParams = req.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    // Build where clause
    let where: any = {}

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const templates = await db.template.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await db.template.count({ where })

    // Log template views for each template (non-blocking)
    try {
      for (const template of templates) {
        await logTemplateView(userId, template.id, template.title).catch(err =>
          console.error('[ACTIVITY_LOG_ERROR]', err)
        )
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
