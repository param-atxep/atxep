"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"

interface Freelancer {
  id: string
  name: string
  email: string
  image?: string
  title?: string
  bio?: string
  rate?: number
  rating?: number
  completedProjects?: number
}

export default function HirePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchFreelancers()
    }
  }, [status])

  const fetchFreelancers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/freelancers?limit=20")
      
      if (!response.ok) {
        throw new Error("Failed to load freelancers")
      }
      
      const data = await response.json()
      setFreelancers(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setFreelancers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredFreelancers = freelancers.filter(f =>
    (f.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (f.title?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Browse Freelancers</h1>
        <p className="text-muted-foreground">Find and hire talented freelancers for your projects</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search freelancers by name or skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button onClick={fetchFreelancers}>
          <Icons.search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {filteredFreelancers.length === 0 && !loading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No freelancers found. Try adjusting your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFreelancers.map(freelancer => (
            <Card key={freelancer.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {freelancer.image ? (
                        <img src={freelancer.image} alt={freelancer.name} className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted" />
                      )}
                      {freelancer.name}
                    </CardTitle>
                    {freelancer.title && (
                      <CardDescription className="mt-1">{freelancer.title}</CardDescription>
                    )}
                  </div>
                  {freelancer.rate && (
                    <div className="text-right">
                      <div className="text-lg font-semibold">${freelancer.rate}/hr</div>
                      {freelancer.rating && (
                        <div className="flex items-center gap-1 text-sm text-yellow-500 mt-1">
                          <Icons.briefcase className="h-3 w-3" />
                          {freelancer.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {freelancer.bio && (
                  <p className="text-sm text-muted-foreground mb-4">{freelancer.bio}</p>
                )}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {freelancer.completedProjects || 0} projects completed
                  </div>
                  <Button>
                    <Icons.briefcase className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
