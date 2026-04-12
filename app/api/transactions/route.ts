import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// Force dynamic rendering - always get fresh data from DB
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in first" },
        { status: 401 }
      )
    }

    const normalizedEmail = session.user.email.toLowerCase().trim()
    const { amount, type, description } = await req.json()

    // Validation
    if (!amount || !type) {
      return NextResponse.json(
        { error: "Missing required fields: amount, type" },
        { status: 400 }
      )
    }

    const validTypes = ["PAYMENT", "EARNING", "REFUND", "WITHDRAWAL"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      )
    }

    const numAmount = parseFloat(amount.toString())
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        userId: user.id,
        type,
        amount: numAmount,
        description: description || null,
        status: "COMPLETED",
      },
    })

    // Update wallet balance based on transaction type
    // THIS MUST SUCCEED - if it fails, data consistency is broken
    try {
      if (type === "EARNING") {
        await db.user.update({
          where: { id: user.id },
          data: {
            walletBalance: { increment: numAmount },
            totalEarned: { increment: numAmount },
          },
        })
      } else if (type === "PAYMENT") {
        await db.user.update({
          where: { id: user.id },
          data: {
            walletBalance: { decrement: numAmount },
            totalSpent: { increment: numAmount },
          },
        })
      } else if (type === "REFUND") {
        await db.user.update({
          where: { id: user.id },
          data: {
            walletBalance: { increment: numAmount },
          },
        })
      }
    } catch (walletErr) {
      console.error("[TRANSACTION_WALLET_UPDATE_FAILED]", walletErr)
      // Delete the transaction we just created since wallet update failed
      // This prevents data inconsistency
      await db.transaction.delete({
        where: { id: transaction.id }
      }).catch(delErr => console.error("[TRANSACTION_ROLLBACK_FAILED]", delErr))
      
      return NextResponse.json(
        { error: "Failed to update wallet. Transaction rolled back. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          transaction: {
            id: transaction.id,
            type: transaction.type,
            amount: transaction.amount.toString(),
            status: transaction.status,
            description: transaction.description,
            createdAt: transaction.createdAt,
          },
        },
        message: "Transaction created successfully",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("[TRANSACTION_POST_ERROR]", error?.message || error)
    return NextResponse.json(
      { error: error?.message || "An error occurred while creating the transaction" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in first" },
        { status: 401 }
      )
    }

    const normalizedEmail = session.user.email.toLowerCase().trim()
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get('type')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Build where clause
    let where: any = {
      userId: user.id,
    }

    if (type) {
      where.type = type
    }

    const transactions = await db.transaction.findMany({
      where,
      select: {
        id: true,
        type: true,
        amount: true,
        netAmount: true,
        commission: true,
        status: true,
        description: true,
        createdAt: true,
        projectId: true,
        templateId: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    })

    const total = await db.transaction.count({ where })

    return NextResponse.json(
      {
        success: true,
        data: {
          transactions: transactions.map((t) => ({
            id: t.id,
            type: t.type,
            amount: t.amount?.toString(),
            netAmount: t.netAmount?.toString() || null,
            commission: t.commission?.toString() || null,
            status: t.status,
            description: t.description,
            createdAt: t.createdAt,
            projectId: t.projectId,
            templateId: t.templateId,
          })),
          pagination: {
            page,
            limit,
            total,
            hasMore: offset + limit < total,
          },
        },
        message: "Transactions retrieved successfully",
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("[TRANSACTION_GET_ERROR]", error?.message || error)
    return NextResponse.json(
      { error: error?.message || "An error occurred while fetching transactions" },
      { status: 500 }
    )
  }
}
