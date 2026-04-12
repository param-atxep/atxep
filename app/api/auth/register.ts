import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Force dynamic rendering - never cache user registration
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/register
 * Register a new user with email/password
 * 
 * SECURITY: This is a CRITICAL auth route
 * - Must never be cached (user creation must happen fresh each time)
 * - Must validate email uniqueness at request time
 * - Must hash passwords before storage
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, name, mobile } = await req.json()

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[REGISTER_ERROR]', error)
    const errorMessage = error?.message || 'Internal server error';
    const errorDetails = process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred during registration';
    return NextResponse.json(
      { error: errorDetails },
      { status: 500 }
    )
  }
}
