"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"

export default function AIHelpPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const generateSuggestions = async () => {
    if (!prompt.trim()) return

    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) throw new Error("Failed to generate suggestions")
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">AI Suggestions</h1>
        <p className="text-muted-foreground mt-1">Get AI-powered recommendations for your projects</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ask AI</CardTitle>
          <CardDescription>Describe what you need help with</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="E.g., 'What freelancers should I hire for a web development project?'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-24"
          />
          <Button onClick={generateSuggestions} disabled={loading || !prompt.trim()} className="w-full">
            {loading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Icons.sparkles className="mr-2 h-4 w-4" />
                Generate Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                  {suggestion}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
  )
}
