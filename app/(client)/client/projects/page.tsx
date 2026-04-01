"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"

interface Project {
  id: string
  title: string
  description: string
  status: string
  budget: number
  deadline: string
  category: string
  createdAt: string
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchProjects()
    }
  }, [status])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/projects")
      if (!response.ok) throw new Error("Failed to load projects")
      const data = await response.json()
      setProjects(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-1">Manage all your active and completed projects</p>
        </div>
        <Button onClick={() => router.push("/client")}>
          <Icons.add className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Icons.briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Button onClick={() => router.push("/client")}>
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map(project => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{project.title}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">{project.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-semibold">${project.budget}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-semibold">{project.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="font-semibold">{new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <Icons.eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Icons.edit className="mr-2 h-4 w-4" />
                    Edit
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
