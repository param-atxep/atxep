"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/more-icons"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"

interface SidebarNavItem {
  href: string
  title: string
  icon: React.ReactNode
  roles?: string[]
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  // Only render client-side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const role = session?.user?.role || "CLIENT"

  // Determine base path based on role
  const basePath = role === "FREELANCER" ? "/freelancer" : "/client"

  const navItems: SidebarNavItem[] = [
    {
      href: basePath,
      title: "Dashboard",
      icon: <Icons.dashboard className="h-4 w-4" />,
    },
    {
      href: `${basePath}/hire`,
      title: "Hire Freelancer",
      icon: <Icons.briefcase className="h-4 w-4" />,
      roles: ["CLIENT"],
    },
    {
      href: `${basePath}/work`,
      title: "Find Work",
      icon: <Icons.search className="h-4 w-4" />,
      roles: ["FREELANCER"],
    },
    {
      href: `${basePath}/templates`,
      title: "Templates",
      icon: <Icons.package className="h-4 w-4" />,
    },
    {
      href: `${basePath}/projects`,
      title: "My Projects",
      icon: <Icons.folder className="h-4 w-4" />,
    },
    {
      href: `${basePath}/upload`,
      title: "Upload Project",
      icon: <Icons.upload className="h-4 w-4" />,
      roles: ["FREELANCER"],
    },
    {
      href: `${basePath}/ai-help`,
      title: "AI Help",
      icon: <Icons.sparkles className="h-4 w-4" />,
    },
    {
      href: `${basePath}/requests`,
      title: "Requests",
      icon: <Icons.bell className="h-4 w-4" />,
    },
    {
      href: `${basePath}/wallet`,
      title: "Wallet & Payments",
      icon: <Icons.creditCard className="h-4 w-4" />,
    },
    {
      href: `${basePath}/offers`,
      title: "Discounts & Offers",
      icon: <Icons.gift className="h-4 w-4" />,
    },
    {
      href: `${basePath}/settings`,
      title: "Settings",
      icon: <Icons.settings className="h-4 w-4" />,
    },
  ]

  const filteredNavItems = navItems.filter((item) => {
    if (item.roles && !item.roles.includes(role)) {
      return false
    }
    return true
  })

  // Check if current path matches nav item (accounting for active state)
  const isActive = (href: string) => {
    const normalizedPathname = pathname.toLowerCase()
    const normalizedHref = href.toLowerCase()
    return normalizedPathname === normalizedHref || normalizedPathname.startsWith(normalizedHref + "/")
  }

  if (!mounted || status === "loading") {
    return (
      <div className="flex h-full flex-col gap-4 border-r border-border bg-background py-4 animate-pulse">
        <div className="px-4 h-10 bg-muted rounded" />
        <div className="flex-1 space-y-2 px-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 border-r border-border bg-background py-4">
      {/* Logo */}
      <div className="px-4">
        <Link href={basePath} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="rounded-md bg-primary p-2">
            <Icons.logo className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight">ALTFaze</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 px-2">
          {filteredNavItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
                prefetch={true}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <span className="flex-1 truncate">{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-border px-4 py-4 space-y-3">
        {session?.user ? (
          <>
            <div className="flex items-center gap-3 rounded-md bg-accent p-3">
              <Image
                src={session.user.image || "https://avatar.vercel.sh/"}
                alt={session.user.name || "User"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.user.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={async () => {
                await signOut({ redirect: true, callbackUrl: "/" })
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <Button size="sm" className="w-full" asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
