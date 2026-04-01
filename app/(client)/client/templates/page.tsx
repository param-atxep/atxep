"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"

interface Template {
  id: string
  title: string
  description: string
  price: number
  category: string
  features: string[]
  author: string
  rating: number
}

export default function TemplatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
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
      fetchTemplates()
    }
  }, [status])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/templates?limit=20")
      if (!response.ok) throw new Error("Failed to load templates")
      const data = await response.json()
      setTemplates(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Templates & Services</h1>
        <p className="text-muted-foreground mt-1">Browse and purchase ready-made templates</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Icons.package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No templates found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle>{template.title}</CardTitle>
                <CardDescription>{template.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                {template.features && template.features.length > 0 && (
                  <div className="mb-4 space-y-1">
                    {template.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="text-sm flex items-center gap-2">
                        <Icons.check className="h-3 w-3 text-green-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold">${template.price}</p>
                  </div>
                  <Button size="sm">
                    <Icons.add className="mr-2 h-4 w-4" />
                    Purchase
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
  )
}
