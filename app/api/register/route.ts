import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

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

    const normalizedEmail = email.toLowerCase().trim()

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with initial username
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name.trim(),
        username: normalizedEmail.split('@')[0] + '_' + nanoid(8),
        role: 'CLIENT', // Default role
      },
    })

    // Create default client profile
    await db.client.create({
      data: {
        userId: user.id,
        company: null,
        description: null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
          },
        },
        message: 'Registration successful',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[REGISTER_ERROR]', error?.message || error)
    return NextResponse.json(
      { error: error?.message || 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
