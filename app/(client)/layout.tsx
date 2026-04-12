// "use client";
import { notFound, redirect } from "next/navigation"
import { Metadata } from "next"
import { getCurrentUser } from "@/lib/session"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ModeToggle } from "@/components/toggle"

// Force dynamic rendering - check auth at request time
export const dynamic = 'force-dynamic'

// @ts-ignore
interface ClientLayoutProps {
  children?: React.ReactNode
}

export const metadata: Metadata = {
  title: 'Client Dashboard | ALTFaze',
  description: 'Manage your projects, hire freelancers, and track progress on ALTFaze',
}

export default async function ClientLayout({ 
  children, 
}: ClientLayoutProps) {
  try {
    const user = await getCurrentUser()
    console.log('[CLIENT_LAYOUT] User retrieved:', { id: user?.id, email: user?.email, role: user?.role })

    if (!user) {
      console.warn('[CLIENT_LAYOUT] ❌ No user found - redirecting to login')
      return redirect('/login')
    }

    // Check if user has a role
    if (!user.role) {
      console.warn('[CLIENT_LAYOUT] ⚠️ User has no role set - redirecting to onboard for role selection')
      return redirect('/onboard')
    }

    // Verify user has CLIENT role
    if (user.role !== 'CLIENT') {
      console.warn('[CLIENT_LAYOUT] ⚠️ User has wrong role:', user.role, '- redirecting to freelancer dashboard')
      return redirect(`/freelancer/my-dashboard`)
    }
    
    console.log('[CLIENT_LAYOUT] ✅ CLIENT role verified - rendering dashboard')
  } catch (error) {
    console.error('[CLIENT_LAYOUT] ❌ Exception in layout:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    // Re-throw to let Next.js handle it
    throw error
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:block w-64 fixed left-0 top-0 h-screen">
        <DashboardSidebar />
      </div>

      {/* Main content */}
      <div className="md:ml-64 flex-1 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex-1" />
            <ModeToggle />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
