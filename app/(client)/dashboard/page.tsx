'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Request {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
  amount: number
  dueDate: string | null
  sender: { id: string; name: string; email: string; image: string | null }
  receiver: { id: string; name: string; email: string; image: string | null }
  createdAt: string
  updatedAt: string
}

interface DashboardData {
  requests: Request[]
  totalRequests: number
  totalSent: number
  totalAccepted: number
  totalCompleted: number
  totalBudget: number
  pagination: {
    page: number
    limit: number
    pages: number
    total: number
  }
}

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-blue-100 text-blue-800',
    REJECTED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-green-100 text-green-800',
  }

  return (
    <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  )
}

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
    console.log('🟢 [CLIENT_DASHBOARD] Page mounted, status:', status, 'role:', session?.user?.role)
  }, [status, session?.user?.role])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/requests?type=sent&limit=50', {
        cache: 'no-store',
      })
      if (!res.ok) {
        throw new Error('Failed to fetch requests')
      }

      const result = await res.json()
      const requests = result.data.requests || []

      const stats = {
        totalRequests: result.data.pagination.total,
        totalSent: requests.length,
        totalAccepted: requests.filter((r: Request) => r.status === 'ACCEPTED').length,
        totalCompleted: requests.filter((r: Request) => r.status === 'COMPLETED').length,
        totalBudget: requests.reduce((sum: number, r: Request) => sum + (r.amount || 0), 0),
      }

      setData({
        requests,
        ...stats,
        pagination: result.data.pagination,
      })
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isClient && status === 'authenticated') {
      console.log('✅ [CLIENT_DASHBOARD] Authenticated, fetching data')
      fetchData()
    } else if (isClient && status === 'unauthenticated') {
      console.log('⚠️ [CLIENT_DASHBOARD] Unauthenticated, redirecting to login')
      router.push('/login')
    }
  }, [isClient, status, fetchData, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome back, {session?.user?.name}! 👋</h1>
          <p className="text-muted-foreground">ALTFaze Client Dashboard - Manage your projects and freelancers</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <div className="text-xl">📋</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalRequests || 0}</div>
              <p className="text-xs text-muted-foreground">Work requests sent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <div className="text-xl">✅</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalAccepted || 0}</div>
              <p className="text-xs text-muted-foreground">Freelancers accepted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <div className="text-xl">🎯</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalCompleted || 0}</div>
              <p className="text-xs text-muted-foreground">Projects completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <div className="text-xl">💰</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${data?.totalBudget.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">Total allocated</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Work Requests</CardTitle>
              <CardDescription>Your sent requests and their current status</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/client/send-request">+ Send Request</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">
                {error}
              </div>
            )}

            {data?.requests && data.requests.length > 0 ? (
              <div className="space-y-4">
                {data.requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{request.title}</h3>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        To: <strong>{request.receiver.name}</strong> • {request.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {request.amount ? `$${request.amount.toFixed(2)}` : 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.dueDate
                          ? `Due: ${new Date(request.dueDate).toLocaleDateString()}`
                          : 'No deadline'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl text-muted-foreground mx-auto mb-4">📋</div>
                <p className="text-muted-foreground">No work requests yet</p>
                <Button asChild className="mt-4">
                  <Link href="/client/send-request">Send your first request</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button asChild className="w-full">
                <Link href="/client/send-request">Send Work Request</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/freelancers">Browse Freelancers</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/client/profile">My Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
