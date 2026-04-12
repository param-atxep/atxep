import { NextRequest } from 'next/server'
import { requireAuth, handleApiError } from '@/lib/auth-middleware'
import { successResponse, ValidationError } from '@/lib/api-utils'

// Force dynamic rendering for AI operations
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/suggestions
 * Generate AI suggestions for project/freelancer
 * Supports: Project descriptions, freelancer search, pricing suggestions
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req)
    const body = await req.json()
    const { type, input, context } = body

    // Validation
    if (!type) throw new ValidationError('Type is required (project, freelancer, pricing)')
    if (!input) throw new ValidationError('Input is required')

    // Type: project → Generate project description improvements
    if (type === 'project') {
      const suggestions = generateProjectSuggestions(input, context)
      return successResponse({ suggestions }, 200, 'Project suggestions generated')
    }

    // Type: freelancer → Generate freelancer profile improvements
    if (type === 'freelancer') {
      const suggestions = generateFreelancerSuggestions(input, context)
      return successResponse({ suggestions }, 200, 'Freelancer suggestions generated')
    }

    // Type: pricing → Generate pricing suggestions
    if (type === 'pricing') {
      const suggestions = generatePricingSuggestions(input, context)
      return successResponse({ suggestions }, 200, 'Pricing suggestions generated')
    }

    throw new ValidationError('Invalid type. Use: project, freelancer, or pricing')
  } catch (error) {
    console.error('AI suggestions error:', error)
    return handleApiError(error)
  }
}

/**
 * Generate suggestions for project descriptions
 */
function generateProjectSuggestions(input: string, context?: any) {
  const suggestions = [
    {
      id: 1,
      title: 'More Detailed Description',
      description: `"${input.substring(0, 50)}..." needs more technology stack and requirements details.`,
      improvement:
        'Add: Tech stack, Browser requirements, Integration needs, Design references (if applicable)',
      severity: 'medium',
    },
    {
      id: 2,
      title: 'Set Clear Timeline',
      description: 'Projects without deadlines attract fewer proposals.',
      improvement: 'Set a specific deadline for the project completion',
      severity: 'high',
    },
    {
      id: 3,
      title: 'Budget Suggestion',
      description: `Based on market rates, you should budget more for quality work.`,
      improvement: `Review competitive pricing for similar ${context?.category || 'web'} projects`,
      severity: 'medium',
    },
    {
      id: 4,
      title: 'Add Deliverables',
      description: 'Clearly list what the freelancer needs to deliver',
      improvement: 'Example: Figma files, Source code, Documentation, Testing report',
      severity: 'high',
    },
    {
      id: 5,
      title: 'Communication Preference',
      description: 'Specify your preferred communication method',
      improvement: 'Email, Slack, Discord, or Regular video calls?',
      severity: 'low',
    },
  ]

  return suggestions
}

/**
 * Generate suggestions for freelancer profiles
 */
function generateFreelancerSuggestions(input: string, context?: any) {
  const suggestions = [
    {
      id: 1,
      title: 'Complete Your Profile',
      description: 'Profiles > 80% complete get 3x more job proposals.',
      improvement: 'Add: Portfolio, hourly rate, detailed bio, and profile picture',
      severity: 'high',
    },
    {
      id: 2,
      title: 'Showcase Your Work',
      description: 'Portfolio links are essential for attracting clients.',
      improvement: 'Add 3-5 best projects with before/after screenshots',
      severity: 'high',
    },
    {
      id: 3,
      title: 'List Relevant Skills',
      description: `"${input.substring(0, 30)}..." has limited skills. ${context?.skillCount || 2} skills is below average.`,
      improvement: 'Add at least 8-10 relevant skills with proficiency levels',
      severity: 'medium',
    },
    {
      id: 4,
      title: 'Set Competitive Rate',
      description: 'Your current rate may limit opportunities.',
      improvement: 'Research market rates for your skills and experience level',
      severity: 'medium',
    },
    {
      id: 5,
      title: 'Request Client Reviews',
      description: 'Building credibility through testimonials attracts more clients.',
      improvement: 'Ask previous clients for reviews and recommendations',
      severity: 'low',
    },
  ]

  return suggestions
}

/**
 * Generate pricing suggestions
 */
function generatePricingSuggestions(input: string, context?: any) {
  const marketRates = {
    'web-development': { min: 500, max: 5000, avg: 2000 },
    'ui-ux-design': { min: 300, max: 3002, avg: 1200 },
    'mobile-app': { min: 1000, max: 8000, avg: 4000 },
    'data-analysis': { min: 400, max: 2000, avg: 900 },
    'content-writing': { min: 50, max: 500, avg: 200 },
    'video-editing': { min: 200, max: 2000, avg: 800 },
    'graphic-design': { min: 100, max: 1500, avg: 600 },
    'marketing': { min: 300, max: 2500, avg: 1000 },
  }

  const category = context?.category || 'web-development'
  const rates = marketRates[category as keyof typeof marketRates] || {
    min: 400,
    max: 2000,
    avg: 1000,
  }

  const suggestions = [
    {
      id: 1,
      title: 'Market Benchmark',
      description: `For ${category} projects, market rates range from ₹${rates.min} to ₹${rates.max}`,
      suggestion: `Average rate: ₹${rates.avg}`,
      severity: 'info',
    },
    {
      id: 2,
      title: 'Complexity Consideration',
      description: 'Higher complexity should command premium rates.',
      suggestion: `Consider charging ₹${Math.round(rates.avg * 1.3)} for advanced requirements`,
      severity: 'info',
    },
    {
      id: 3,
      title: 'Rush Job Premium',
      description: 'Tight deadlines justify higher pricing.',
      suggestion: `Add 20-50% premium for rush jobs (₹${Math.round(rates.avg * 1.25)} - ₹${Math.round(rates.avg * 1.5)})`,
      severity: 'info',
    },
    {
      id: 4,
      title: 'Package Deals',
      description: 'Offer tiered pricing to attract different client segments.',
      suggestion: `Basic: ₹${rates.avg}, Pro: ₹${Math.round(rates.avg * 1.5)}, Premium: ₹${Math.round(rates.avg * 2.5)}`,
      severity: 'info',
    },
  ]

  return suggestions
}
