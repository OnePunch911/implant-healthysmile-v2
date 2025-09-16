import { NextApiRequest, NextApiResponse } from 'next'
import { LeadService, hashPhoneForLogging } from '../../lib/supabase/client'

interface LeadRequestBody {
  name: string
  phone: string
  consent: boolean
}

interface ApiResponse {
  ok: boolean
  id?: string
  created_at?: string
  code?: string
  message?: string
}

// Validation functions
const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false
  const trimmedName = name.trim()
  return trimmedName.length >= 1 && trimmedName.length <= 15
}

const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false
  const phoneRegex = /^\d{3}-\d{4}-\d{4}$/
  return phoneRegex.test(phone)
}

const validateConsent = (consent: boolean): boolean => {
  return consent === true
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      ok: false,
      code: 'method_not_allowed',
      message: 'Only POST method is allowed'
    })
    return
  }

  try {
    // Check if required environment variables are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables')
      res.status(503).json({
        ok: false,
        code: 'env_missing',
        message: 'Server configuration error'
      })
      return
    }

    const { name, phone, consent }: LeadRequestBody = req.body

    // Validate input data
    if (!validateName(name)) {
      res.status(400).json({
        ok: false,
        code: 'invalid_name',
        message: 'Invalid name format'
      })
      return
    }

    if (!validatePhone(phone)) {
      res.status(400).json({
        ok: false,
        code: 'invalid_phone',
        message: 'Invalid phone format'
      })
      return
    }

    if (!validateConsent(consent)) {
      res.status(400).json({
        ok: false,
        code: 'consent_required',
        message: 'Consent is required'
      })
      return
    }

    // Initialize database service
    const leadService = new LeadService()

    // Insert lead into database
    const result = await leadService.insertLead(name.trim(), phone)

    // Log successful submission with masked phone number
    const maskedPhone = hashPhoneForLogging(phone)
    console.log(`Lead submitted successfully: name=${name.trim()}, phone=${maskedPhone}, id=${result.id}`)

    // Return success response
    res.status(200).json({
      ok: true,
      id: result.id.toString(),
      created_at: result.created_at
    })

  } catch (error) {
    console.error('Lead submission error:', error)

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Missing Supabase environment variables')) {
        res.status(503).json({
          ok: false,
          code: 'env_missing',
          message: 'Server configuration error'
        })
        return
      }

      if (error.message.includes('Database')) {
        res.status(500).json({
          ok: false,
          code: 'db_error',
          message: 'Database operation failed'
        })
        return
      }
    }

    // Generic server error
    res.status(500).json({
      ok: false,
      code: 'server_error',
      message: 'Internal server error'
    })
  }
}