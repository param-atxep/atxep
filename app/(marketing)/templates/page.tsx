'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'

interface Template {
  id: string
  name: string
  description: string
  category: string
  price: number
  image: string | null
  rating: number
  downloads: number
  features: string[]
  uploader: { id: string; name: string; image: string | null }
  createdAt: string
}

interface TemplatesResponse {
  data: {
    templates: Template[]
    pagination: { page: number; limit: number; total: number; pages: number; hasMore: boolean }
  }
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(12)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        ...(search && { search }),
        ...(category && { category }),
      })

      const res = await fetch(`/api/templates?${params}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Failed to fetch templates')

      const json: TemplatesResponse = await res.json()
      setTemplates(json.data.templates)
      setTotal(json.data.pagination.total)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }, [search, category, page, limit])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const categories = ['React', 'Next.js', 'Vue', 'Svelte', 'TypeScript', 'E-commerce']
  const pages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Template Marketplace</h1>
          <p className="text-muted-foreground">Browse and purchase premium templates</p>
        </div>

        <div className="mb-8 flex gap-4 flex-wrap">
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="max-w-sm"
          />
          <select
            value={category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setCategory(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 border rounded-md border-input bg-background"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        ) : templates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/templates/${template.id}`}>
                  {template.image && (
                    <div className="h-40 bg-muted overflow-hidden">
                      <Image
                        src={template.image}
                        alt={template.name}
                        width={300}
                        height={160}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                </Link>
                <CardHeader>
                  <Link href={`/templates/${template.id}`}>
                    <CardTitle className="hover:underline">{template.name}</CardTitle>
                  </Link>
                  <CardDescription>{template.description}</CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{template.category}</Badge>
                    {template.rating && <Badge variant="secondary">{template.rating}⭐</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {template.price === 0 ? 'Free' : `$${template.price}`}
                      </div>
                      <p className="text-xs text-muted-foreground">{template.downloads} downloads</p>
                    </div>
                    <Button asChild>
                      <Link href={`/templates/${template.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No templates found</p>
          </div>
        )}

        {pages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            {[...Array(Math.min(pages, 5))].map((_, i) => {
              const pageNum = page > 3 ? page - 2 + i : i + 1
              if (pageNum > pages) return null
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
