import { NextApiRequest, NextApiResponse } from 'next'
import { LeadService } from '../../lib/supabase/client'
import { EmailService } from '../../lib/email/service'
import { createExcelBuffer, getLast24HoursRange } from '../../lib/excel/export'

interface ExportResponse {
  ok: boolean
  count?: number
  code?: string
  message?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExportResponse>
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({
      ok: false,
      code: 'method_not_allowed',
      message: 'Only GET method is allowed'
    })
    return
  }

  try {
    // Check if required environment variables are set
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'MAIL_PROVIDER',
      'MAIL_API_KEY',
      'MAIL_FROM',
      'MAIL_TO'
    ]

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

    if (missingEnvVars.length > 0) {
      console.error('Missing required environment variables:', missingEnvVars)
      res.status(503).json({
        ok: false,
        code: 'env_missing',
        message: `Missing environment variables: ${missingEnvVars.join(', ')}`
      })
      return
    }

    // Initialize services
    const leadService = new LeadService()
    const emailService = new EmailService()

    // Get date range for export (last 24 hours)
    const { startDate, endDate } = getLast24HoursRange()

    console.log(`Exporting leads from ${startDate.toISOString()} to ${endDate.toISOString()}`)

    // Fetch leads from the database
    const leads = await leadService.getLeadsFromDateRange(startDate, endDate)

    console.log(`Found ${leads.length} leads for export`)

    // Create Excel file
    const excelBuffer = createExcelBuffer(leads)

    // Send email with Excel attachment
    await emailService.sendLeadReport(leads, excelBuffer)

    // Log successful export
    const kstNow = new Date(Date.now() + (9 * 60 * 60 * 1000))
    console.log(`Lead export completed successfully at ${kstNow.toISOString()}: ${leads.length} leads exported and emailed`)

    // Return success response
    res.status(200).json({
      ok: true,
      count: leads.length
    })

  } catch (error) {
    console.error('Export-mail error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Missing') && error.message.includes('environment variables')) {
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

      if (error.message.includes('Email')) {
        res.status(500).json({
          ok: false,
          code: 'mail_error',
          message: 'Email sending failed'
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

// For testing purposes - export the handler
export { handler as testHandler }