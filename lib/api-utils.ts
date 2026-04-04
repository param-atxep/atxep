/**
 * Standard API Response Utilities
 * Ensures consistent API responses across all endpoints
 */

import { NextResponse } from 'next/server'

/**
 * Standard successful API response
 */
export function successResponse<T>(
  data: T,
  status = 200,
  message = 'Success'
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Standard error API response
 */
export function errorResponse(
  status: number,
  message: string,
  error?: any
) {
  const errorData: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  }

  // Include error details in development only
  if (process.env.NODE_ENV === 'development' && error) {
    errorData.error = error.message || String(error)
  }

  return NextResponse.json(errorData, { status })
}

/**
 * Custom Error Classes for type-safe error handling
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

/**
 * Format currency values safely
 */
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 1000) // Limit length
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: any): boolean {
  const num = parseFloat(value)
  return !isNaN(num) && num > 0
}

/**
 * Validate decimal amount
 */
export function isValidAmount(amount: any, minAmount = 0, maxAmount = 999999999): boolean {
  const num = parseFloat(amount)
  return !isNaN(num) && num >= minAmount && num <= maxAmount
}
