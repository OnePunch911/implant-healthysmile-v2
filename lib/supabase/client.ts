import { createClient } from '@supabase/supabase-js'

// Database schema interface
export interface LandingLead {
  id: number
  name: string
  phone: string
  created_at: string
}

// Create Supabase client with service role key for server-side operations
export function createSupabaseServiceClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database operations
export class LeadService {
  private client

  constructor() {
    this.client = createSupabaseServiceClient()
  }

  async insertLead(name: string, phone: string): Promise<LandingLead> {
    const { data, error } = await this.client
      .from('landing_leads')
      .insert({
        name: name.trim(),
        phone: phone,
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      throw new Error(`Database insert failed: ${error.message}`)
    }

    return data
  }

  async getLeadsFromLastDay(): Promise<LandingLead[]> {
    // Get leads from the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data, error } = await this.client
      .from('landing_leads')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database query error:', error)
      throw new Error(`Database query failed: ${error.message}`)
    }

    return data || []
  }

  async getLeadsFromDateRange(startDate: Date, endDate: Date): Promise<LandingLead[]> {
    const { data, error } = await this.client
      .from('landing_leads')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database query error:', error)
      throw new Error(`Database query failed: ${error.message}`)
    }

    return data || []
  }
}

// Utility function to hash phone numbers for server logging
export function hashPhoneForLogging(phone: string): string {
  const salt = process.env.IP_HASH_SALT || 'default_salt'

  // Simple hash for logging purposes (don't use for security)
  let hash = 0
  const str = phone + salt
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Return masked phone number for logging
  return phone.slice(0, 3) + '-****-' + phone.slice(-4)
}