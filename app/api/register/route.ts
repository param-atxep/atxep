<<<<<<< HEAD
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
=======
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { successResponse, errorResponse, ValidationError, ConflictError, isValidEmail } from '@/lib/api-utils'
import { rateLimit, AUTH_RATE_LIMIT } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const limited = !(await rateLimit(req, 'register', AUTH_RATE_LIMIT.limit, AUTH_RATE_LIMIT.window))
    if (limited) {
      return errorResponse(429, 'Too many registration attempts. Please try again later.')
    }

    const body = await req.json()
    const { email, password, name } = body

    // Validation
    if (!email || !password || !name) {
      return errorResponse(400, 'Email, password, and name are required')
    }

    if (!isValidEmail(email)) {
      return errorResponse(400, 'Invalid email format')
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (password.length < 6) {
<<<<<<< HEAD
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
=======
      return errorResponse(400, 'Password must be at least 6 characters')
    }

    if (name.trim().length < 2) {
      return errorResponse(400, 'Name must be at least 2 characters')
    }

    if (name.trim().length > 100) {
      return errorResponse(400, 'Name must be less than 100 characters')
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
<<<<<<< HEAD
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
=======
      return errorResponse(409, 'Email already registered. Please login instead.')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)

    // Create user with initial username
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name.trim(),
        username: normalizedEmail.split('@')[0] + '_' + nanoid(8),
<<<<<<< HEAD
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
=======
        role: 'CLIENT',
        isVerified: false, // Require email verification in production
        client: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'ACCOUNT_CREATED',
        description: `User account created: ${user.email}`,
      },
    }).catch(err => console.error('[ACTIVITY_LOG_ERROR]', err))

    return successResponse(
      {
        user,
        message: 'Account created successfully. Please log in.',
      },
      201,
      'Registration successful'
    )
  } catch (error: any) {
    console.error('[REGISTER_ERROR]', error?.message || error)
    
    // Handle Prisma errors
    if (error?.code === 'P2002') {
      return errorResponse(409, 'Email already registered')
    }

    return errorResponse(500, error?.message || 'An error occurred during registration')
  }
}

>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
