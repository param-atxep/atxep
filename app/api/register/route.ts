import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, mobile } = await req.json()

    console.log('[REGISTER] Attempting registration for:', email)

    // Validation
    if (!email || !password || !name) {
      console.log('[REGISTER] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.log('[REGISTER] Password too short')
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
      console.log('[REGISTER] Email already registered:', email)
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

    console.log('[REGISTER] User created successfully:', user.id)

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
    console.error('[REGISTER_ERROR]', error?.message || error)
    const errorMessage = error?.message || 'An error occurred during registration'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
