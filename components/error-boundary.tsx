/**
 * Global Error Boundary Component
 * Catches all client-side errors and displays fallback UI
 */

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/more-icons'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to error reporting service (Sentry, etc.)
    console.error('[ERROR_BOUNDARY]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-6 text-center">
        <div>
          <Icons.logo className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;re sorry, but something unexpected happened. Please try again.
          </p>
        </div>

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm font-mono text-foreground break-words">
            {error.message || 'An unknown error occurred'}
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={reset}
            className="flex-1"
          >
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex-1"
          >
            Back to home
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </div>
        )}
      </div>
    </div>
  )
}
