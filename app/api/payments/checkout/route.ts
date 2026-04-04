import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, handleApiError } from '@/lib/auth-middleware'
<<<<<<< HEAD
import { successResponse, errorResponse, ValidationError } from '@/lib/api'
import { createCheckoutSession } from '@/lib/stripe'
import { logPaymentCompletion } from '@/lib/activity'
import { validateAmount } from '@/lib/commission'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
=======
import { successResponse, errorResponse, isValidAmount } from '@/lib/api-utils'
import { createCheckoutSession } from '@/lib/stripe'
import { logPaymentCompletion } from '@/lib/activity'
import { rateLimit, API_RATE_LIMIT } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const { userId, email } = await requireAuth(req)
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)

    const body = await req.json()
    const { freelancerId, amount, projectId, templateId, description } = body

    // Validation
<<<<<<< HEAD
    if (!freelancerId) throw new ValidationError('freelancerId is required')
    if (!amount) throw new ValidationError('amount is required')

    const amountValidation = validateAmount(amount)
    if (!amountValidation.valid) {
      throw new ValidationError(amountValidation.error || 'Invalid amount')
=======
    if (!freelancerId) {
      return errorResponse(400, 'freelancerId is required')
    }

    if (!isValidAmount(amount, 0.01)) {
      return errorResponse(400, 'Valid amount is required (minimum 0.01)')
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    }

    // Verify freelancer exists
    const freelancer = await db.user.findUnique({
      where: { id: freelancerId },
<<<<<<< HEAD
    })
    if (!freelancer) {
      throw new ValidationError('Freelancer not found')
    }

    // Verify client has sufficient balance or is a new client
    const client = await db.user.findUnique({
      where: { id: userId },
    })
    if (!client) {
      throw new ValidationError('Client not found')
=======
      select: { id: true, email: true, name: true },
    })

    if (!freelancer) {
      return errorResponse(404, 'Freelancer not found')
    }

    // Verify client exists and get details
    const client = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, stripeCustomerId: true },
    })

    if (!client) {
      return errorResponse(404, 'Client not found')
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    }

    // Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
<<<<<<< HEAD
    const session = await createCheckoutSession({
      clientId: userId,
      freelancerId: freelancerId,
      amount: parseFloat(amount),
      projectId,
      templateId,
      description,
      successUrl: `${appUrl}/payment-success?sessionId={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/payment-cancelled`,
    })

    // Create pending transaction record
    await db.transaction.create({
      data: {
        userId: userId,
        type: 'PAYMENT',
        amount: parseFloat(amount),
        status: 'PENDING',
        stripeSessionId: session.id,
        description: description || 'Payment for project/template',
        senderId: userId,
        receiverId: freelancerId,
        projectId: projectId || null,
        templateId: templateId || null,
        metadata: {
          checkoutSessionId: session.id,
          freelancerId,
        },
      },
    })

    return successResponse(
      {
        sessionId: session.id,
        url: session.url,
        amount,
        description,
      },
      200,
=======
    
    try {
      const session = await createCheckoutSession({
        clientId: userId,
        freelancerId: freelancerId,
        amount: parseFloat(amount),
        projectId: projectId || undefined,
        templateId: templateId || undefined,
        description: description || 'Payment for project/template',
        successUrl: `${appUrl}/payment-success?sessionId={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${appUrl}/payment-cancelled`,
      })

      // Create pending transaction record
      await db.transaction.create({
        data: {
          userId: userId,
          type: 'PAYMENT',
          amount: parseFloat(amount),
          status: 'PENDING',
          stripeSessionId: session.id,
          description: description || 'Payment for project/template',
          senderId: userId,
          receiverId: freelancerId,
          projectId: projectId || null,
          templateId: templateId || null,
          metadata: {
            checkoutSessionId: session.id,
            freelancerId,
            clientEmail: client.email,
            freelancerEmail: freelancer.email,
          },
        },
      })

      return successResponse(
        {
          sessionId: session.id,
          url: session.url,
          amount: parseFloat(amount),
          description: description || 'Payment',
          currency: 'inr',
        },
        200,
        'Checkout session created'
      )
    } catch (stripeError: any) {
      console.error('[STRIPE_ERROR]', stripeError)
      return errorResponse(500, 'Failed to create payment session. Please try again.')
    }
  } catch (error) {
    console.error('[PAYMENTS_CHECKOUT_ERROR]', error)
    return handleApiError(error)
  }
}

/**
 * GET /api/payments/checkout?sessionId=...
 * Get checkout session status
 */
export async function GET(req: NextRequest) {
  try {
    const limited = !(await rateLimit(req, 'api', API_RATE_LIMIT.limit, API_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many requests. Please try again later.')
    }

    const { userId } = await requireAuth(req)

    const sessionId = req.nextUrl.searchParams.get('sessionId')

    if (!sessionId) {
      return errorResponse(400, 'sessionId is required')
    }

    // Get transaction by session ID
    const transaction = await db.transaction.findUnique({
      where: { stripeSessionId: sessionId },
      select: {
        id: true,
        status: true,
        amount: true,
        description: true,
        createdAt: true,
      },
    })

    if (!transaction) {
      return errorResponse(404, 'Transaction not found')
    }

    return successResponse(
      {
        transactionId: transaction.id,
        status: transaction.status,
        amount: transaction.amount.toNumber(),
        description: transaction.description,
        createdAt: transaction.createdAt,
      },
      200,
      'Checkout session retrieved'
    )
  } catch (error) {
    console.error('[PAYMENTS_GET_ERROR]', error)
    return handleApiError(error)
  }
}
      200,
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
      'Checkout session created'
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return handleApiError(error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)

    const searchParams = req.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      throw new ValidationError('sessionId query parameter is required')
    }

    // Fetch transaction details
    const transaction = await db.transaction.findUnique({
      where: { stripeSessionId: sessionId },
    })

    if (!transaction) {
      throw new ValidationError('Transaction not found')
    }

    if (transaction.userId !== userId) {
      throw new ValidationError('Unauthorized to view this transaction')
    }

    return successResponse(
      {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        netAmount: transaction.netAmount,
        commission: transaction.commission,
        description: transaction.description,
        createdAt: transaction.createdAt,
      },
      200,
      'Transaction retrieved'
    )
  } catch (error) {
    console.error('Get checkout error:', error)
    return handleApiError(error)
  }
}
