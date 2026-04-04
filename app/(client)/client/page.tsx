"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Icons } from "@/components/more-icons"
import { Skeleton } from "@/components/ui/skeleton"
<<<<<<< HEAD
=======
import { useRouter } from "next/navigation"
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)

interface DashboardStats {
  totalEarned: number
  totalSpent: number
  projectCount: number
  requestCount: number
  walletBalance: number
}

export default function ClientDashboard() {
  const { data: session, status } = useSession()
<<<<<<< HEAD
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
=======
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
<<<<<<< HEAD
        const [walletRes, projectsRes, requestsRes] = await Promise.all([
          fetch('/api/wallet'),
          fetch(`/api/projects?my=true&limit=100`),
          fetch(`/api/requests?limit=100`)
=======
        setError(null)

        const [walletRes, projectsRes, requestsRes] = await Promise.all([
          fetch('/api/wallet').catch(err => {
            console.error('Wallet fetch error:', err)
            return { ok: false }
          }),
          fetch(`/api/projects?my=true&limit=100`).catch(err => {
            console.error('Projects fetch error:', err)
            return { ok: false }
          }),
          fetch(`/api/requests?limit=100`).catch(err => {
            console.error('Requests fetch error:', err)
            return { ok: false }
          }),
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
        ])

        let walletData = { walletBalance: 0, totalEarned: 0, totalSpent: 0 }
        let projectCount = 0
        let requestCount = 0

        if (walletRes.ok) {
<<<<<<< HEAD
          const wallet = await walletRes.json()
          walletData = wallet.data || walletData
        }

        if (projectsRes.ok) {
          const projects = await projectsRes.json()
          projectCount = projects.data?.pagination?.total || 0
        }

        if (requestsRes.ok) {
          const requests = await requestsRes.json()
          requestCount = requests.data?.pagination?.total || 0
=======
          try {
            const wallet = await walletRes.json()
            walletData = wallet.data || walletData
          } catch (e) {
            console.error('Failed to parse wallet response:', e)
          }
        }

        if (projectsRes.ok) {
          try {
            const projects = await projectsRes.json()
            projectCount = projects.data?.pagination?.total || 0
          } catch (e) {
            console.error('Failed to parse projects response:', e)
          }
        }

        if (requestsRes.ok) {
          try {
            const requests = await requestsRes.json()
            requestCount = requests.data?.pagination?.total || 0
          } catch (e) {
            console.error('Failed to parse requests response:', e)
          }
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
        }

        setStats({
          totalEarned: walletData.totalEarned || 0,
          totalSpent: walletData.totalSpent || 0,
          projectCount,
          requestCount,
<<<<<<< HEAD
          walletBalance: walletData.walletBalance || 0
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
=======
          walletBalance: walletData.walletBalance || 0,
        })
      } catch (err) {
        console.error('Failed to fetch stats:', err)
        setError('Failed to load dashboard. Refresh page to try again.')
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchStats()
<<<<<<< HEAD
    }
  }, [status])
=======
    } else if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (status === 'loading') {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name || 'User'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Hire talented freelancers, manage projects, and expand your team at ATXEP.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Icons.creditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalSpent || 0)}
                </div>
                <p className="text-xs text-muted-foreground">On all projects</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Icons.wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.walletBalance || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Available balance</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Projects</CardTitle>
            <Icons.briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.projectCount || 0}</div>
                <p className="text-xs text-muted-foreground">Active and completed</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Icons.bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.requestCount || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting action</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/client/hire">
              <Button className="w-full justify-start" variant="ghost">
                <Icons.briefcase className="mr-2 h-4 w-4" />
                Find Freelancers
              </Button>
            </Link>
            <Link href="/client/projects">
              <Button className="w-full justify-start" variant="ghost">
                <Icons.check className="mr-2 h-4 w-4" />
                View My Projects
              </Button>
            </Link>
            <Link href="/client/templates">
              <Button className="w-full justify-start" variant="ghost">
                <Icons.fileText className="mr-2 h-4 w-4" />
                Browse Templates
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Learn and optimize your work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/help">
              <Button className="w-full justify-start" variant="ghost">
                <Icons.helpCircle className="mr-2 h-4 w-4" />
                Help Center
              </Button>
            </Link>
            <Link href="/settings">
              <Button className="w-full justify-start" variant="ghost">
                <Icons.settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
>>>>>>> 6562c65 (Fixing All The Problems & Adding The Exception Handling)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session?.user?.name}!</h1>
        <p className="text-muted-foreground mt-2">
          Hire talented freelancers, manage projects, and expand your team at ATXEP.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Icons.creditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalSpent || 0)}
                </div>
                <p className="text-xs text-muted-foreground">On all projects</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Icons.wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats?.walletBalance || 0)}</div>
                <p className="text-xs text-muted-foreground">Available balance</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Projects</CardTitle>
            <Icons.briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.projectCount || 0}</div>
                <p className="text-xs text-muted-foreground">Active and completed</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Icons.bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.requestCount || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting action</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/client/hire">
              <Button className="w-full justify-start" variant="ghost">
                <Icons.briefcase className="mr-2 h-4 w-4" />
                Find Freelancers
              </Button>
            </Link>
            <Link href="/client/projects">
              <Button className="w-full justify-start" variant="ghost">
                <Icons.check className="mr-2 h-4 w-4" />
                View My Projects
              </Button>
            </Link>
            <Link href="/client/templates">
              <Button className="w-full justify-start" variant="ghost">
                <Icons.fileText className="mr-2 h-4 w-4" />
                Browse Templates
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Learn and optimize your work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/client/ai-help">
              <Button className="w-full justify-start" variant="ghost">
                <Icons.sparkles className="mr-2 h-4 w-4" />
                Get AI Suggestions
              </Button>
            </Link>
            <Link href="/client/requests">
              <Button className="w-full justify-start" variant="ghost">
                <Icons.send className="mr-2 h-4 w-4" />
                View Requests
              </Button>
            </Link>
            <Link href="/client/settings">
              <Button className="w-full justify-start" variant="ghost">
                <Icons.settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
