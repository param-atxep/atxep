// "use client";
import { notFound, redirect } from "next/navigation"
import { Metadata } from "next"
import { getCurrentUser } from "@/lib/session"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ModeToggle } from "@/components/toggle"

{/* @ts-ignore */}

interface ClientLayoutProps {
  children?: React.ReactNode
}

export const metadata: Metadata = {
  title: 'Client Dashboard | ATXEP',
  description: 'Manage your projects, hire freelancers, and track progress on ATXEP',
}

export default async function ClientLayout({ 
  children, 
}: ClientLayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is CLIENT role - if no role, redirect to onboard
  if (!user.role) {
    redirect('/onboard')
  }

  if (user.role !== 'CLIENT') {
    redirect('/freelancer/dashboard')
  }

  // If client profile not created, redirect to onboard
  if (!user.client) {
    redirect('/onboard')
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
