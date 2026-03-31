import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { successResponse, handleApiError, ValidationError } from "@/lib/api"

export async function POST(req: Request) {
  try {
    console.log("[ONBOARD] Starting request...")
    
    const session = await getAuthSession()
    console.log("[ONBOARD] Session email:", session?.user?.email)

    if (!session?.user?.email) {
      console.log("[ONBOARD] No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    console.log("[ONBOARD] Body:", body)
    
    const { role, title, bio, hourlyRate, company, description, name } = body

    if (!role || !["CLIENT", "FREELANCER"].includes(role)) {
      console.log("[ONBOARD] Invalid role:", role)
      return NextResponse.json({ error: "Invalid role. Use CLIENT or FREELANCER" }, { status: 400 })
    }

    // Update user role in database
    console.log("[ONBOARD] Updating user with email:", session.user.email)
    const updatedUser = await db.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        role,
        ...(name && { name }),
      },
    })
    console.log("[ONBOARD] User updated:", updatedUser.id)

    // Create freelancer profile if role is FREELANCER
    if (role === "FREELANCER") {
      console.log("[ONBOARD] Checking for existing freelancer...")
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
      }
    }

    // Create client profile if role is CLIENT
    if (role === "CLIENT") {
      console.log("[ONBOARD] Checking for existing client...")
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
      } else if (company || description) {
        console.log("[ONBOARD] Updating existing client profile...")
        await db.client.update({
          where: { userId: updatedUser.id },
          data: {
            ...(company && { company }),
            ...(description && { description }),
          },
        })
      }
    }

    console.log("[ONBOARD] Fetching updated profile...")
    const updatedProfile = await db.user.findUnique({
      where: { id: updatedUser.id },
      include: {
        freelancer: true,
        client: true,
      },
    })

    console.log("[ONBOARD] Success!")
    return NextResponse.json(
      { 
        success: true, 
        user: updatedProfile,
        message: `${role} profile created successfully`
      }, 
      { status: 200 }
    )
  } catch (error) {
    console.error("[ONBOARD_ERROR]", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[ONBOARD_ERROR_DETAILS]", errorMessage)
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 })
  }
}
