import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuthWithRole, handleApiError } from '@/lib/auth-middleware'
<<<<<<< HEAD
import { successResponse, errorResponse, ValidationError } from '@/lib/api'

/**
 * GET /api/projects
 * Get projects (filter by status, creator, submitter)
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuthWithRole(req)

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit
    const myProjects = searchParams.get('my') === 'true'

    // Build where clause
=======
import { successResponse, errorResponse, ValidationError, isValidAmount } from '@/lib/api-utils'
import { rateLimit, API_RATE_LIMIT } from '@/lib/rate-limit'

/**
 * GET /api/projects
 * Get projects (filter by status, category, creator, etc.)
 */
export async function GET(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    await requireAuthWithRole(req)

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const offset = (page - 1) * limit
    const myProjects = searchParams.get('my') === 'true'
    const userId = (await requireAuthWithRole(req)).userId

    // Build where clause with validation
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    let where: any = {}

    if (myProjects) {
      where.creatorId = userId
    }

<<<<<<< HEAD
    if (status) {
      where.status = status
    }

    const projects = await db.project.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true },
        },
        submitter: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await db.project.count({ where })
=======
    if (status && ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      where.status = status
    }

    if (category && category.trim()) {
      where.category = category.trim()
    }

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, email: true, image: true },
          },
          submitter: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.project.count({ where }),
    ])
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)

    return successResponse(
      {
        projects: projects.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          budget: p.budget?.toNumber() || 0,
          status: p.status,
          category: p.category,
          deadline: p.deadline,
          creator: p.creator,
          submitter: p.submitter,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
        pagination: {
          page,
          limit,
          total,
<<<<<<< HEAD
=======
          pages: Math.ceil(total / limit),
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
          hasMore: offset + limit < total,
        },
      },
      200,
      'Projects retrieved successfully'
    )
  } catch (error) {
    console.error('[PROJECTS_GET_ERROR]', error)
    return handleApiError(error)
  }
}

/**
 * POST /api/projects
 * Create new project (CLIENT only)
 */
export async function POST(req: NextRequest) {
  try {
<<<<<<< HEAD
=======
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    const auth = await requireAuthWithRole(req, 'CLIENT')
    const { userId } = auth
    const body = await req.json()
    const { title, description, budget, category, deadline } = body

    // Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
<<<<<<< HEAD
      throw new ValidationError('Valid title is required')
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      throw new ValidationError('Valid description is required')
    }
    if (!budget || isNaN(parseFloat(budget)) || parseFloat(budget) <= 0) {
      throw new ValidationError('Valid budget is required and must be greater than 0')
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      throw new ValidationError('Valid category is required')
    }

    const budgetNum = parseFloat(budget.toString())
    if (budgetNum > 999999999) {
      throw new ValidationError('Budget exceeds maximum limit')
=======
      return errorResponse(400, 'Valid title is required')
    }

    if (title.trim().length > 200) {
      return errorResponse(400, 'Title must be less than 200 characters')
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return errorResponse(400, 'Valid description is required')
    }

    if (description.trim().length > 5000) {
      return errorResponse(400, 'Description must be less than 5000 characters')
    }

    if (!isValidAmount(budget, 0.01, 999999999)) {
      return errorResponse(400, 'Valid budget is required (0.01 - 999,999,999)')
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return errorResponse(400, 'Valid category is required')
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    }

    // Create project
    const project = await db.project.create({
      data: {
        title: title.trim(),
        description: description.trim(),
<<<<<<< HEAD
        budget: budgetNum,
=======
        budget: parseFloat(budget.toString()),
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
        category: category.trim(),
        deadline: deadline ? new Date(deadline) : null,
        creatorId: userId,
        status: 'OPEN',
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    })

    // Log activity (non-blocking)
<<<<<<< HEAD
    try {
      await db.activityLog.create({
        data: {
          userId,
          action: 'PROJECT_CREATED',
          description: `Created project: ${title}`,
          metadata: { projectId: project.id },
        },
      }).catch(err => console.error('[ACTIVITY_LOG_ERROR]', err))
    } catch (err) {
      console.error('[ACTIVITY_LOG_ERROR]', err)
    }
=======
    await db.activityLog.create({
      data: {
        userId,
        action: 'PROJECT_CREATED',
        description: `Created project: ${title}`,
        metadata: { projectId: project.id },
      },
    }).catch(err => console.error('[ACTIVITY_LOG_ERROR]', err))
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)

    return successResponse(
      {
        id: project.id,
        title: project.title,
        description: project.description,
        budget: project.budget?.toNumber() || 0,
        status: project.status,
        category: project.category,
        deadline: project.deadline,
        creator: project.creator,
        createdAt: project.createdAt,
      },
      201,
      'Project created successfully'
    )
  } catch (error) {
    console.error('[PROJECTS_POST_ERROR]', error)
    return handleApiError(error)
  }
}

/**
 * PATCH /api/projects/:id
<<<<<<< HEAD
 * Update project status (accept project for freelancer)
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireAuthWithRole(req, 'FREELANCER')
=======
 * Update project status
 */
export async function PATCH(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const { userId } = await requireAuthWithRole(req)
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    const body = await req.json()
    const { projectId, status } = body

    if (!projectId || typeof projectId !== 'string') {
<<<<<<< HEAD
      throw new ValidationError('Valid projectId is required')
    }
    if (!status || typeof status !== 'string') {
      throw new ValidationError('Valid status is required')
=======
      return errorResponse(400, 'Valid projectId is required')
    }

    if (!status || typeof status !== 'string') {
      return errorResponse(400, 'Valid status is required')
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    }

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
<<<<<<< HEAD
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
=======
      return errorResponse(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`)
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    }

    // Get project
    const project = await db.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
<<<<<<< HEAD
      throw new ValidationError('Project not found')
=======
      return errorResponse(404, 'Project not found')
    }

    // Check authorization
    if (project.creatorId !== userId && project.submiterId !== userId) {
      return errorResponse(403, 'You do not have permission to update this project')
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    }

    // Update project
    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: {
        status,
        submiterId: status === 'IN_PROGRESS' ? userId : project.submiterId,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        submitter: { select: { id: true, name: true, email: true } },
      },
    })

<<<<<<< HEAD
=======
    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        action: 'PROJECT_UPDATED',
        description: `Updated project status to ${status}`,
        metadata: { projectId },
      },
    }).catch(err => console.error('[ACTIVITY_LOG_ERROR]', err))

    return successResponse(
      {
        id: updatedProject.id,
        title: updatedProject.title,
        status: updatedProject.status,
        creator: updatedProject.creator,
        submitter: updatedProject.submitter,
        updatedAt: updatedProject.updatedAt,
      },
      200,
      'Project updated successfully'
    )
  } catch (error) {
    console.error('[PROJECTS_PATCH_ERROR]', error)
    return handleApiError(error)
  }
}
        submitter: { select: { id: true, name: true, email: true } },
      },
    })

>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    // Log activity (non-blocking)
    if (status === 'IN_PROGRESS') {
      try {
        await db.activityLog.create({
          data: {
            userId,
            action: 'PROJECT_ACCEPTED',
            description: `Accepted project: ${project.title}`,
            metadata: { projectId: project.id },
          },
        }).catch(err => console.error('[ACTIVITY_LOG_ERROR]', err))
      } catch (err) {
        console.error('[ACTIVITY_LOG_ERROR]', err)
      }
    }

    return successResponse(
      {
        id: updatedProject.id,
        title: updatedProject.title,
        status: updatedProject.status,
        submitter: updatedProject.submitter,
        updatedAt: updatedProject.updatedAt,
      },
      200,
      `Project status updated to ${status}`
    )
  } catch (error) {
    console.error('[PROJECTS_PATCH_ERROR]', error)
    return handleApiError(error)
  }
}
