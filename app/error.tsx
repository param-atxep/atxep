/**
 * Root layout error handler
 * Catches all errors in the application
 */

'use client'

import { ErrorBoundary } from '@/components/error-boundary'

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundary error={error} reset={reset} />
}
