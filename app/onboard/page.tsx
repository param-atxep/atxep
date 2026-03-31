"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/more-icons"

export default function OnboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "FREELANCER" | null>(null)

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  if (status === "loading") {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="animate-spin">
          <Icons.logo className="h-8 w-8" />
        </div>
      </div>
    )
  }

  const handleRoleSelection = async (role: "CLIENT" | "FREELANCER") => {
    console.log("🔵 [ONBOARD_FRONTEND] Role selection clicked:", role)
    
    try {
      setLoading(true)
      setSelectedRole(role)

      console.log("🔵 [ONBOARD_FRONTEND] Sending request to API...")
      const response = await fetch("/api/users/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          name: session?.user.name,
        }),
      })

      console.log("🔵 [ONBOARD_FRONTEND] Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("🟢 [ONBOARD_FRONTEND] Success! User role updated:", data)
        
        // Refresh server-side data and session
        console.log("🔵 [ONBOARD_FRONTEND] Refreshing session...")
        router.refresh()
        
        // Wait for session to update, then redirect
        console.log("🔵 [ONBOARD_FRONTEND] Waiting 1 second before redirect...")
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const redirectUrl = role === "CLIENT" ? "/client/dashboard" : "/freelancer/dashboard"
        console.log("🟢 [ONBOARD_FRONTEND] Redirecting to:", redirectUrl)
        router.push(redirectUrl)
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("❌ [ONBOARD_FRONTEND] API Error:", response.status, errorData)
        setLoading(false)
        setSelectedRole(null)
        alert(`Error saving role: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("❌ [ONBOARD_FRONTEND] Exception:", error)
      setLoading(false)
      setSelectedRole(null)
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
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
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {session?.user.name}!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us what you do so we can personalize your experience
            </p>
          </div>
        </div>

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
