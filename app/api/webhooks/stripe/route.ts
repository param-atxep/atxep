import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const amount = parseFloat(session.metadata?.amount || '0')

      if (userId && amount > 0) {
        // Update transaction to completed
        await db.transaction.updateMany({
          where: {
            userId,
            relatedResourceId: session.id,
            status: 'PENDING',
          },
          data: {
            status: 'COMPLETED',
          },
        })

        // Add funds to wallet
        await db.user.update({
          where: { id: userId },
          data: {
            walletBalance: {
              increment: amount,
            },
          },
        })

        // Log activity
        await db.activityLog.create({
          data: {
            userId,
            action: 'WALLET_TOPUP',
            resourceType: 'WALLET',
            resourceId: session.id,
            metadata: {
              amount,
              stripeSessionId: session.id,
            },
          },
        })
      }
    }

    // Handle checkout.session.expired
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId

      if (userId) {
        await db.transaction.updateMany({
          where: {
            userId,
            relatedResourceId: session.id,
            status: 'PENDING',
          },
          data: {
            status: 'FAILED',
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[WEBHOOK_ERROR]', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
