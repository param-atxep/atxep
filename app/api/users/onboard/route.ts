import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// Force dynamic rendering - always get fresh data from DB
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      console.error('[ONBOARD_ERROR] No session or user in session')
      return NextResponse.json(
        { error: "Unauthorized - Please log in first" },
        { status: 401 }
      )
    }

    const emailToUse = session.user.email?.toLowerCase().trim()

    if (!emailToUse) {
      console.error('[ONBOARD_ERROR] No email in session user:', session.user)
      return NextResponse.json(
        { error: "Session email not found. Please log in again." },
        { status: 401 }
      )
    }

    // Get user from database (they should exist from login)
    let user = await db.user.findUnique({
      where: { email: emailToUse },
    })

    if (!user) {
      console.error('[ONBOARD_ERROR] User not found for email:', emailToUse)
      return NextResponse.json(
        { error: "User not found. Please log in again." },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { role, title, bio, hourlyRate, company, description, skills } = body

    // Validate role
    if (!role || !["CLIENT", "FREELANCER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be CLIENT or FREELANCER." },
        { status: 400 }
      )
    }

    // Update user role and ensure username is set
    user = await db.user.update({
      where: { id: user.id },
      data: {
        role,
        ...(session.user.name && !user.name && { name: session.user.name }),
        // Ensure username exists for all users
        ...(
          !user.username && {
            username: emailToUse.split('@')[0] + '_' + user.id.slice(0, 8),
          }
        ),
      },
    })

    // Handle freelancer profile
    if (role === "FREELANCER") {
      const existingFreelancer = await db.freelancer.findUnique({
        where: { userId: user.id },
      })

      if (existingFreelancer) {
        // Update existing profile
        await db.freelancer.update({
          where: { userId: user.id },
          data: {
            ...(title && { title }),
            ...(bio && { bio }),
            ...(hourlyRate && { hourlyRate: parseFloat(hourlyRate.toString()) }),
            ...(skills && Array.isArray(skills) && { skills }),
          },
        })
      } else {
        // Create new profile
        await db.freelancer.create({
          data: {
            userId: user.id,
            title: title || null,
            bio: bio || null,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate.toString()) : null,
            skills: Array.isArray(skills) ? skills : [],
          },
        })
      }
    }

    // Handle client profile
    if (role === "CLIENT") {
      const existingClient = await db.client.findUnique({
        where: { userId: user.id },
      })

      if (existingClient) {
        // Update existing profile
        await db.client.update({
          where: { userId: user.id },
          data: {
            ...(company && { company }),
            ...(description && { description }),
          },
        })
      } else {
        // Create new profile
        await db.client.create({
          data: {
            userId: user.id,
            company: company || null,
            description: description || null,
          },
        })
      }
    }

    // Fetch complete updated profile
    const updatedProfile = await db.user.findUnique({
      where: { id: user.id },
      include: {
        freelancer: true,
        client: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          user: updatedProfile,
        },
        message: `${role} profile setup completed`,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("[ONBOARD_ERROR]", error?.message || error)
    return NextResponse.json(
      {
        error: error?.message || "An error occurred during onboarding",
      },
      { status: 500 }
    )
  }
}
