"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"

interface Request {
  id: string
  freelancerId?: string
  freelancerName?: string
  amount: number
  description: string
  status: string
  createdAt: string
}

export default function RequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchRequests()
    }
  }, [status])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/requests")
      if (!response.ok) throw new Error("Failed to load requests")
      const data = await response.json()
      setRequests(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACCEPTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Work Requests</h1>
        <p className="text-muted-foreground mt-1">Manage requests from freelancers on your projects</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Icons.inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{request.freelancerName || "Freelancer"}</CardTitle>
                      <Badge className={getStatusBadge(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">{request.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${request.amount}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    {request.status === "PENDING" && (
                      <>
                        <Button size="sm" variant="outline">
                          Reject
                        </Button>
                        <Button size="sm">
                          <Icons.check className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                      </>
                    )}
                    {request.status === "ACCEPTED" && (
                      <Button size="sm" variant="outline">
                        <Icons.eye className="mr-2 h-4 w-4" />
                        View Progress
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
