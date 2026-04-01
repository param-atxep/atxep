import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuthWithRole, handleApiError } from '@/lib/auth-middleware'
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
    let where: any = {}

    if (myProjects) {
      where.creatorId = userId
    }

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
    const auth = await requireAuthWithRole(req, 'CLIENT')
    const { userId } = auth
    const body = await req.json()
    const { title, description, budget, category, deadline } = body

    // Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
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
    }

    // Create project
    const project = await db.project.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        budget: budgetNum,
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
 * Update project status (accept project for freelancer)
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireAuthWithRole(req, 'FREELANCER')
    const body = await req.json()
    const { projectId, status } = body

    if (!projectId || typeof projectId !== 'string') {
      throw new ValidationError('Valid projectId is required')
    }
    if (!status || typeof status !== 'string') {
      throw new ValidationError('Valid status is required')
    }

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }

    // Get project
    const project = await db.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      throw new ValidationError('Project not found')
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
