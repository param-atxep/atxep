import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { successResponse, handleApiError, ValidationError } from "@/lib/api"

export async function POST(req: Request) {
  try {
    console.log("\n========== [ONBOARD API] START ==========")
    console.log("[ONBOARD] Timestamp:", new Date().toISOString())
    console.log("[ONBOARD] Method:", req.method)
    console.log("[ONBOARD] URL:", req.url)
    
    const session = await getAuthSession()
    console.log("[ONBOARD] Full session:", JSON.stringify(session, null, 2))
    console.log("[ONBOARD] Session user:", session?.user)
    console.log("[ONBOARD] Session user id:", session?.user?.id)
    console.log("[ONBOARD] Session user email:", session?.user?.email)

    if (!session?.user) {
      console.log("[ONBOARD_ERROR] No session found - Unauthorized")
      return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 })
    }

    // Try to use ID first, fallback to email
    let userId = session.user.id
    let userEmail = session.user.email?.toLowerCase().trim()

    console.log("[ONBOARD] Normalized email:", userEmail)

    if (!userId && !userEmail) {
      console.log("[ONBOARD_ERROR] No user ID or email in session")
      return NextResponse.json({ error: "Session invalid - Missing user identifier" }, { status: 401 })
    }

    const body = await req.json()
    console.log("[ONBOARD] Request body:", JSON.stringify(body))
    
    const { role, title, bio, hourlyRate, company, description, name } = body

    if (!role || !["CLIENT", "FREELANCER"].includes(role)) {
      console.log("[ONBOARD_ERROR] Invalid role:", role)
      return NextResponse.json({ error: "Invalid role. Use CLIENT or FREELANCER" }, { status: 400 })
    }

    console.log("[ONBOARD] Role validation passed:", role)

    // Verify user exists in database
    console.log("[ONBOARD] Verifying user exists in database...")
    let existingUser
    
    if (userId) {
      console.log("[ONBOARD] Looking up user by ID:", userId)
      existingUser = await db.user.findUnique({
        where: { id: userId }
      })
    } else if (userEmail) {
      console.log("[ONBOARD] Looking up user by email:", userEmail)
      existingUser = await db.user.findUnique({
        where: { email: userEmail }
      })
    }

    if (!existingUser) {
      console.log("[ONBOARD_ERROR] User not found in database. ID:", userId, "Email:", userEmail)
      
      // Try to find any user with similar email for debugging
      if (userEmail) {
        const allUsers = await db.user.findMany({
          where: {
            email: {
              contains: userEmail.split('@')[0],
              mode: 'insensitive'
            }
          },
          select: { id: true, email: true, name: true }
        })
        console.log("[ONBOARD_ERROR] Similar users found:", allUsers)
      }
      
      return NextResponse.json({ 
        error: "User account not found in database",
        details: `User lookup failed: ${userId ? `ID: ${userId}` : `Email: ${userEmail}`}`
      }, { status: 404 })
    }

    console.log("[ONBOARD] ✅ User found:", existingUser.id, existingUser.email)

    // Update user role in database
    console.log("[ONBOARD] Updating user in database...")
    const updatedUser = await db.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        role,
        ...(name && { name }),
      },
    })
    console.log("[ONBOARD] ✅ User updated successfully. User ID:", updatedUser.id)

    // Create freelancer profile if role is FREELANCER
    if (role === "FREELANCER") {
      console.log("[ONBOARD] Checking for existing freelancer profile...")
      const existingFreelancer = await db.freelancer.findUnique({
        where: { userId: updatedUser.id },
      })

      if (!existingFreelancer) {
        console.log("[ONBOARD] Creating new freelancer profile...")
        await db.freelancer.create({
          data: {
            userId: updatedUser.id,
            title: title || undefined,
            bio: bio || undefined,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
            skills: [],
          },
        })
        console.log("[ONBOARD] ✅ Freelancer profile created")
      } else if (title || bio || hourlyRate) {
        console.log("[ONBOARD] Updating existing freelancer profile...")
        await db.freelancer.update({
          where: { userId: updatedUser.id },
          data: {
            ...(title && { title }),
            ...(bio && { bio }),
            ...(hourlyRate && { hourlyRate: parseFloat(hourlyRate) }),
          },
        })
        console.log("[ONBOARD] ✅ Freelancer profile updated")
      } else {
        console.log("[ONBOARD] Freelancer profile exists, no updates needed")
      }
    }

    // Create client profile if role is CLIENT
    if (role === "CLIENT") {
      console.log("[ONBOARD] Checking for existing client profile...")
      const existingClient = await db.client.findUnique({
        where: { userId: updatedUser.id },
      })

      if (!existingClient) {
        console.log("[ONBOARD] Creating new client profile...")
        await db.client.create({
          data: {
            userId: updatedUser.id,
            company: company || undefined,
            description: description || undefined,
          },
        })
        console.log("[ONBOARD] ✅ Client profile created")
      } else if (company || description) {
        console.log("[ONBOARD] Updating existing client profile...")
        await db.client.update({
          where: { userId: updatedUser.id },
          data: {
            ...(company && { company }),
            ...(description && { description }),
          },
        })
        console.log("[ONBOARD] ✅ Client profile updated")
      } else {
        console.log("[ONBOARD] Client profile exists, no updates needed")
      }
    }

    console.log("[ONBOARD] Fetching complete updated profile...")
    const updatedProfile = await db.user.findUnique({
      where: { id: updatedUser.id },
      include: {
        freelancer: true,
        client: true,
      },
    })

    console.log("[ONBOARD] ✅ SUCCESS! Profile updated completely")
    console.log("========== [ONBOARD API] END ==========\n")
    
    return NextResponse.json(
      { 
        success: true, 
        user: updatedProfile,
        message: `${role} profile created successfully`
      }, 
      { status: 200 }
    )
  } catch (error) {
    console.error("\n========== [ONBOARD_ERROR] FAILURE ==========")
    console.error("[ONBOARD_ERROR] Error object:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[ONBOARD_ERROR] Error message:", errorMessage)
    console.error("[ONBOARD_ERROR] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("========== [ONBOARD_ERROR] END ==========\n")
    
    return NextResponse.json({ 
      error: "Internal server error", 
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
