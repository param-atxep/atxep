"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/more-icons"

// Force dynamic rendering for auth pages
export const dynamic = "force-dynamic"

export default function OnboardPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "FREELANCER" | null>(null)
  const [error, setError] = useState<string>("")
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, isClient, router])

  if (!isClient || status === "loading") {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="animate-spin">
          <Icons.logo className="h-8 w-8" />
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  const handleRoleSelection = async (role: "CLIENT" | "FREELANCER") => {
    console.log("🔵 [ONBOARD_FRONTEND] Role selection clicked:", role)
    
    if (!session?.user?.email) {
      setError("No session found. Please log in again.")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSelectedRole(role)

      console.log("🔵 [ONBOARD_FRONTEND] Sending role to API:", role)
      const response = await fetch("/api/users/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          name: session?.user?.name || "User",
        }),
      })

      console.log("🔵 [ONBOARD_FRONTEND] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        const errorMsg = errorData.error || `Server error: ${response.status}`
        console.error("❌ [ONBOARD_FRONTEND] API Error:", errorMsg)
        setError(errorMsg)
        setLoading(false)
        setSelectedRole(null)
        return
      }

      const data = await response.json()
      console.log("🟢 [ONBOARD_FRONTEND] Success:", data)

      console.log("🔄 [ONBOARD_FRONTEND] Waiting for server to sync role update...")
      
      // Wait for server to process role update AND for JWT to be issued with new role
      // First delay for DB write
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Refresh session to get updated role from JWT
      console.log("🔄 [ONBOARD_FRONTEND] Refreshing session with new role...")
      const updateResult = await update()
      console.log("🔄 [ONBOARD_FRONTEND] Session update result:", updateResult)
      
      if (!updateResult) {
        console.warn("🟡 [ONBOARD_FRONTEND] Session update returned null, but continuing...")
      }

      // Wait additional time for session cache to update
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Verify role was actually updated in session
      console.log("🔄 [ONBOARD_FRONTEND] Verifying role update...")
      let verifyAttempts = 0
      let roleVerified = false
      
      while (verifyAttempts < 3 && !roleVerified) {
        const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' })
        const sessionData = await sessionRes.json()
        console.log("🔵 [ONBOARD_FRONTEND] Session check " + (verifyAttempts + 1) + ":", { role: sessionData?.user?.role })
        
        if (sessionData?.user?.role === role) {
          roleVerified = true
          console.log("✅ [ONBOARD_FRONTEND] Role verified in session!")
          break
        }
        
        verifyAttempts++
        if (verifyAttempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      if (!roleVerified) {
        console.warn("🟡 [ONBOARD_FRONTEND] Role not verified after 3 attempts, proceeding anyway...")
      }

      // ✅ FIXED: Use correct dashboard paths
      const redirectUrl = role === "CLIENT" ? "/client/dashboard" : "/freelancer/my-dashboard"
      console.log("🟢 [ONBOARD_FRONTEND] Redirecting to dashboard:", redirectUrl)
      
      // Use router.replace() to avoid navigation issues
      router.replace(redirectUrl)
    } catch (error) {
      console.error("❌ [ONBOARD_FRONTEND] Exception:", error)
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setError(errorMsg)
      setLoading(false)
      setSelectedRole(null)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <button
        onClick={() => router.back()}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8"
        )}
      >
        <>
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Back
        </>
      </button>

      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[450px]">
        <div className="flex flex-col space-y-4 text-center">
          <Icons.logo className="mx-auto h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {session?.user?.name || "User"}!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us what you do so we can personalize your experience
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-xs text-red-600 underline mt-2 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-4">
          {/* Client Role */}
          <button
            onClick={() => handleRoleSelection("CLIENT")}
            disabled={loading}
            className={cn(
              "relative flex flex-col items-start gap-4 rounded-lg border-2 p-6 text-left transition-all hover:border-primary hover:bg-accent disabled:opacity-50",
              selectedRole === "CLIENT" && loading ? "border-primary bg-accent" : "border-border"
            )}
          >
            <div className="flex items-start justify-between w-full">
              <div>
                <h3 className="font-semibold">I&apos;m a Client</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  I want to hire freelancers, buy templates, and build projects
                </p>
              </div>
              <div className="rounded-full bg-primary p-2">
                <Icons.briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Browse and hire freelancers</li>
              <li>✓ Buy templates and components</li>
              <li>✓ Create and manage projects</li>
              <li>✓ Get AI help with your ideas</li>
            </ul>
          </button>

          {/* Freelancer Role */}
          <button
            onClick={() => handleRoleSelection("FREELANCER")}
            disabled={loading}
            className={cn(
              "relative flex flex-col items-start gap-4 rounded-lg border-2 p-6 text-left transition-all hover:border-primary hover:bg-accent disabled:opacity-50",
              selectedRole === "FREELANCER" && loading ? "border-primary bg-accent" : "border-border"
            )}
          >
            <div className="flex items-start justify-between w-full">
              <div>
                <h3 className="font-semibold">I&apos;m a Freelancer</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  I want to offer services, sell templates, and earn money
                </p>
              </div>
              <div className="rounded-full bg-primary p-2">
                <Icons.code className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Find work and projects</li>
              <li>✓ Sell templates and components</li>
              <li>✓ Upload and manage projects</li>
              <li>✓ Track earnings and payments</li>
            </ul>
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            You can change your role anytime in settings
          </p>
        </div>
      </div>
    </div>
  )
}
