import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, handleApiError } from '@/lib/auth-middleware'
import { successResponse, errorResponse, isValidAmount } from '@/lib/api-utils'
import { rateLimit, API_RATE_LIMIT } from '@/lib/rate-limit'

// Force dynamic rendering - always get fresh data from DB
export const dynamic = 'force-dynamic'

/**
 * GET /api/wallet
 * Get user wallet details, balance, and transaction history
 */
export async function GET(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const { userId } = await requireAuth(req)

    const searchParams = req.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const offset = (page - 1) * limit

    // Get user wallet data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        walletBalance: true,
        totalSpent: true,
        totalEarned: true,
        image: true,
      },
    })

    if (!user) {
      return errorResponse(404, 'User not found')
    }

    // Get transactions (payments and earnings)
    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where: {
          OR: [{ userId }, { senderId: userId }, { receiverId: userId }],
        },
        select: {
          id: true,
          type: true,
          amount: true,
          netAmount: true,
          commission: true,
          status: true,
          description: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.transaction.count({
        where: {
          OR: [{ userId }, { senderId: userId }, { receiverId: userId }],
        },
      }),
    ])

    return successResponse(
      {
        wallet: {
          userId: user.id,
          email: user.email,
          name: user.name,
          walletBalance: user.walletBalance.toNumber(),
          totalSpent: user.totalSpent.toNumber(),
          totalEarned: user.totalEarned.toNumber(),
        },
        transactions: transactions.map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount.toNumber(),
          netAmount: t.netAmount?.toNumber() || 0,
          commission: t.commission?.toNumber() || 0,
          status: t.status,
          description: t.description,
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
      'Wallet data retrieved successfully'
    )
  } catch (error) {
    console.error('[WALLET_GET_ERROR]', error)
    return handleApiError(error)
  }
}

/**
 * POST /api/wallet
 * Add funds to wallet
 */
export async function POST(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const { userId } = await requireAuth(req)
    const body = await req.json()
    const { amount, description } = body

    // Validation
    if (!isValidAmount(amount, 0.01)) {
      return errorResponse(400, 'Valid amount is required (minimum 0.01)')
    }

    // Create wallet addition transaction
    const transaction = await db.transaction.create({
      data: {
        userId,
        type: 'PAYMENT',
        amount: parseFloat(amount),
        status: 'PENDING',
        description: description || 'Wallet top-up',
      },
    })

    return successResponse(
      {
        transactionId: transaction.id,
        amount: transaction.amount.toNumber(),
        status: transaction.status,
        message: 'Proceed with payment to complete wallet top-up',
      },
      201,
      'Wallet transaction initialized'
    )
  } catch (error) {
    console.error('[WALLET_POST_ERROR]', error)
    return handleApiError(error)
  }
}
