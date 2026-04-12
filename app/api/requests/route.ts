import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, handleApiError } from '@/lib/auth-middleware'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { rateLimit, API_RATE_LIMIT } from '@/lib/rate-limit'

// Force dynamic rendering - always get fresh data from DB
export const dynamic = 'force-dynamic'

/**
 * GET /api/requests
 * ALTFaze: Fetch user's work requests (sent or received)
 * 
 * Query params:
 * - type: 'sent' | 'received' | undefined (all)
 * - status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
 * - limit: 1-100 (default: 20)
 * - page: >= 1 (default: 1)
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
          sender: { 
            select: { 
              id: true, 
              name: true, 
              email: true, 
              image: true,
              role: true
            } 
          },
          receiver: { 
            select: { 
              id: true, 
              name: true, 
              email: true, 
              image: true,
              role: true
            } 
          },
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
    }).catch((err: any) => console.error('[ACTIVITY_LOG_ERROR]', err))

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
    const actionMap: Record<string, string> = {
      ACCEPTED: 'REQUEST_ACCEPTED',
      REJECTED: 'REQUEST_REJECTED',
      COMPLETED: 'REQUEST_COMPLETED',
      PENDING: 'REQUEST_PENDING',
    }

    await db.activityLog.create({
      data: {
        userId,
        action: actionMap[status] || 'REQUEST_UPDATED',
        description: `Request status updated to ${status}`,
        metadata: { requestId, previousStatus: request.status, newStatus: status },
      },
    }).catch((err: any) => console.error('[ACTIVITY_LOG_ERROR]', err))

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

/**
 * DELETE /api/requests
 * Cancel/delete a request (only sender can delete)
 */
export async function DELETE(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const { userId } = await requireAuth(req)
    const body = await req.json()
    const { requestId } = body

    if (!requestId || typeof requestId !== 'string') {
      return errorResponse(400, 'Valid requestId is required')
    }

    // Get request
    const request = await db.request.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return errorResponse(404, 'Request not found')
    }

    // Check authorization (only sender can delete)
    if (request.senderId !== userId) {
      return errorResponse(403, 'You do not have permission to delete this request')
    }

    // Delete request
    await db.request.delete({
      where: { id: requestId },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        action: 'REQUEST_DELETED',
        description: `Deleted request: ${request.title}`,
        metadata: { requestId },
      },
    }).catch((err: any) => console.error('[ACTIVITY_LOG_ERROR]', err))

    return successResponse(
      { id: requestId },
      200,
      'Request deleted successfully'
    )
  } catch (error) {
    console.error('[REQUESTS_DELETE_ERROR]', error)
    return handleApiError(error)
  }
}
