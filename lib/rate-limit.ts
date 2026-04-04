/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP/user
 */

import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const DEFAULT_LIMIT = 100 // requests per window
const DEFAULT_WINDOW = 60 * 1000 // 1 minute

/**
 * Rate limit middleware
 * Usage: if (!await rateLimit(req, 'api-key')) return errorResponse(429, 'Too many requests')
 */
export async function rateLimit(
  req: NextRequest,
  identifier?: string,
  limit = DEFAULT_LIMIT,
  window = DEFAULT_WINDOW
): Promise<boolean> {
  const key = identifier || req.ip || 'unknown'
  const now = Date.now()

  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    // New rate limit window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + window,
    })
    return true
  }

  if (record.count >= limit) {
    return false // Rate limit exceeded
  }

  record.count++
  return true
}

/**
 * Stricter rate limit for auth endpoints
 */
export const AUTH_RATE_LIMIT = {
  limit: 5,
  window: 15 * 60 * 1000, // 15 minutes
}

/**
 * Moderate rate limit for general APIs
 */
export const API_RATE_LIMIT = {
  limit: 100,
  window: 60 * 1000, // 1 minute
}

/**
 * Loose rate limit for public endpoints
 */
export const PUBLIC_RATE_LIMIT = {
  limit: 1000,
  window: 60 * 1000, // 1 minute
}

/**
 * Clean up old entries periodically (run in background)
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  const keysToDelete: string[] = []

  rateLimitStore.forEach((value, key) => {
    if (now > value.resetTime) {
      keysToDelete.push(key)
    }
  })

  keysToDelete.forEach(key => rateLimitStore.delete(key))
}

// Clean up every hour
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitStore, 60 * 60 * 1000)
}
