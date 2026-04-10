import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, handleApiError } from '@/lib/auth-middleware'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { rateLimit, API_RATE_LIMIT } from '@/lib/rate-limit'

/**
 * GET /api/requests
 * Get work requests (sent or received)
 */
export async function GET(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const { userId } = await requireAuth(req)

    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get('type') // 'sent' or 'received'
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const offset = (page - 1) * limit

    // Build where clause
    let where: any = {}

    if (type === 'sent') {
      where.senderId = userId
    } else if (type === 'received') {
      where.receiverId = userId
    } else {
      where.OR = [{ senderId: userId }, { receiverId: userId }]
    }

    if (status && ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
      where.status = status
    }

    const [requests, total] = await Promise.all([
      db.request.findMany({
        where,
        include: {
          sender: { select: { id: true, name: true, email: true, image: true } },
          receiver: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    const [requests, total] = await Promise.all([
      db.request.findMany({
        where,
        include: {
          sender: { select: { id: true, name: true, email: true, image: true } },
          receiver: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.request.count({ where }),
    ])

    return successResponse(
      {
        requests: requests.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status,
          amount: r.amount?.toNumber() || 0,
          dueDate: r.dueDate,
          sender: r.sender,
          receiver: r.receiver,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
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
      'Requests retrieved successfully'
    )
  } catch (error) {
    console.error('[REQUESTS_GET_ERROR]', error)
    return handleApiError(error)
  }
}

/**
 * POST /api/requests
 * Send work request to freelancer
 */
export async function POST(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const { userId } = await requireAuth(req)
    const body = await req.json()
    const { receiverId, title, description, amount, dueDate, projectId } = body

    // Validation
    if (!receiverId || typeof receiverId !== 'string') {
      return errorResponse(400, 'Valid receiverId is required')
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return errorResponse(400, 'Valid title is required')
    }

    // Check receiver exists
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
      select: { id: true, email: true, name: true },
    })

    if (!receiver) {
      return errorResponse(404, 'Freelancer not found')
    }

    // Create request
    const newRequest = await db.request.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        senderId: userId,
        receiverId: receiverId,
        amount: amount ? parseFloat(amount) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: projectId || null,
        status: 'PENDING',
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        action: 'REQUEST_SENT',
        description: `Sent request to ${receiver.name}: ${title}`,
        metadata: { requestId: newRequest.id, receiverId },
      },
    }).catch(err => console.error('[ACTIVITY_LOG_ERROR]', err))

    return successResponse(
      {
        id: newRequest.id,
        title: newRequest.title,
        status: newRequest.status,
        sender: newRequest.sender,
        receiver: newRequest.receiver,
        createdAt: newRequest.createdAt,
      },
      201,
      'Request sent successfully'
    )
  } catch (error) {
    console.error('[REQUESTS_POST_ERROR]', error)
    return handleApiError(error)
  }
}

/**
 * PATCH /api/requests
 * Update request status (accept/reject/complete)
 */
export async function PATCH(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const { userId } = await requireAuth(req)
    const body = await req.json()
    const { requestId, status } = body

    if (!requestId || typeof requestId !== 'string') {
      return errorResponse(400, 'Valid requestId is required')
    }

    if (!status || !['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return errorResponse(400, 'Valid status is required')
    }

    // Get request
    const request = await db.request.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return errorResponse(404, 'Request not found')
    }

    // Check authorization (only receiver can accept/reject)
    if (request.receiverId !== userId && status !== 'COMPLETED') {
      return errorResponse(403, 'You do not have permission to update this request')
   }

    // Update request
    const updatedRequest = await db.request.update({
      where: { id: requestId },
      data: { status },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        action: 'REQUEST_UPDATED',
        description: `Updated request status to ${status}`,
        metadata: { requestId },
      },
    }).catch(err => console.error('[ACTIVITY_LOG_ERROR]', err))

    return successResponse(
      {
        id: updatedRequest.id,
        title: updatedRequest.title,
        status: updatedRequest.status,
        sender: updatedRequest.sender,
        receiver: updatedRequest.receiver,
        updatedAt: updatedRequest.updatedAt,
      },
      200,
      `Request ${status.toLowerCase()} successfully`
    )
  } catch (error) {
    console.error('[REQUESTS_PATCH_ERROR]', error)
    return handleApiError(error)
  }
}
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)

    return successResponse(
      {
        requests: requests.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status,
          amount: r.amount?.toNumber() || null,
          dueDate: r.dueDate,
          sender: r.sender,
          receiver: r.receiver,
          projectId: r.projectId,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + limit < total,
        },
      },
      200,
      'Requests retrieved'
    )
  } catch (error) {
    console.error('Get requests error:', error)
    return handleApiError(error)
  }
}

/**
 * POST /api/requests
 * Send work request to freelancer
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const body = await req.json()
    const { title, description, freelancerId, amount, dueDate, projectId } = body

    // Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new ValidationError('Valid title is required')
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      throw new ValidationError('Valid description is required')
    }
    if (!freelancerId || typeof freelancerId !== 'string') {
      throw new ValidationError('Valid freelancerId is required')
    }

    // Verify freelancer exists
    const freelancer = await db.user.findUnique({
      where: { id: freelancerId },
    })
    if (!freelancer) {
      throw new ValidationError('Freelancer not found')
    }

    // Validate amount if provided
    if (amount) {
      const amountValidation = validateAmount(amount)
      if (!amountValidation.valid) {
        throw new ValidationError(amountValidation.error || 'Invalid amount')
      }
    }

    // Create request
    const request = await db.request.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        senderId: userId,
        receiverId: freelancerId,
        amount: amount ? parseFloat(amount.toString()) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: projectId || null,
        status: 'PENDING',
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    })

    // Log activity (non-blocking)
    try {
      await logActivity(
        userId,
        'REQUEST_SENT',
        `Sent request: ${title} to ${freelancer.name}`,
        { requestId: request.id, receiverId: freelancerId }
      )
    } catch (err) {
      console.error('[ACTIVITY_LOG_ERROR]', err)
    }

    return successResponse(
      {
        id: request.id,
        title: request.title,
        description: request.description,
        status: request.status,
        amount: request.amount?.toNumber() || null,
        dueDate: request.dueDate,
        sender: request.sender,
        receiver: request.receiver,
        createdAt: request.createdAt,
      },
      201,
      'Request sent successfully'
    )
  } catch (error) {
    console.error('[REQUESTS_POST_ERROR]', error)
    return handleApiError(error)
  }
}

/**
 * PATCH /api/requests/:id
 * Accept or reject request
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const body = await req.json()
    const { requestId, status } = body

    if (!requestId || typeof requestId !== 'string') {
      throw new ValidationError('Valid requestId is required')
    }
    if (!status || typeof status !== 'string') {
      throw new ValidationError('Valid status is required')
    }

    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }

    // Get request
    const request = await db.request.findUnique({
      where: { id: requestId },
      include: { sender: { select: { id: true, name: true, email: true } }, receiver: { select: { id: true, name: true, email: true } } },
    })

    if (!request) {
      throw new ValidationError('Request not found')
    }

    // Verify user is receiver
    if (request.receiverId !== userId) {
      throw new ValidationError('Only the request receiver can update its status')
    }

    // Verify valid status transition
    if (request.status !== 'PENDING' && status !== 'COMPLETED') {
      throw new ValidationError(`Cannot change status from ${request.status} to ${status}`)
    }

    // Update request
    const updatedRequest = await db.request.update({
      where: { id: requestId },
      data: { status },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    })

    // Log activity (non-blocking)
    try {
      const action = status === 'ACCEPTED' ? 'REQUEST_ACCEPTED' : 'REQUEST_REJECTED'
      await logActivity(
        userId,
        action,
        `${status.charAt(0) + status.slice(1).toLowerCase()} request: ${request.title}`,
        { requestId, status }
      ).catch(err => console.error('[ACTIVITY_LOG_ERROR]', err))
    } catch (err) {
      console.error('[ACTIVITY_LOG_ERROR]', err)
    }

    return successResponse(
      {
        id: updatedRequest.id,
        status: updatedRequest.status,
        title: updatedRequest.title,
        sender: updatedRequest.sender,
        receiver: updatedRequest.receiver,
        updatedAt: updatedRequest.updatedAt,
      },
      200,
      `Request ${status.toLowerCase()} successfully`
    )
  } catch (error) {
    console.error('[REQUESTS_PATCH_ERROR]', error)
    return handleApiError(error)
  }
}
