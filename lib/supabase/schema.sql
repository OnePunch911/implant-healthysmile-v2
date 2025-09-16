-- Supabase Database Schema for Landing Page Leads
-- Execute this in your Supabase SQL Editor

-- Create the landing_leads table
CREATE TABLE IF NOT EXISTS public.landing_leads (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL CHECK (char_length(trim(name)) >= 1 AND char_length(trim(name)) <= 15),
    phone VARCHAR(20) NOT NULL CHECK (phone ~ '^\d{3}-\d{4}-\d{4}$'),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_landing_leads_created_at ON public.landing_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_landing_leads_phone ON public.landing_leads(phone);

-- Enable Row Level Security (RLS)
ALTER TABLE public.landing_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to have full access
-- This allows the service role key to INSERT/SELECT/UPDATE/DELETE
CREATE POLICY "Service role has full access to landing_leads"
ON public.landing_leads
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Optionally, create a policy for read-only access for anon users (if needed for admin)
-- CREATE POLICY "Admin read access to landing_leads"
-- ON public.landing_leads
-- FOR SELECT
-- TO anon
-- USING (false); -- Change to appropriate condition if needed

-- Add comments for documentation
COMMENT ON TABLE public.landing_leads IS 'Stores landing page lead submissions for dental implant consultations';
COMMENT ON COLUMN public.landing_leads.id IS 'Unique identifier for each lead';
COMMENT ON COLUMN public.landing_leads.name IS 'Customer name (1-15 characters, trimmed)';
COMMENT ON COLUMN public.landing_leads.phone IS 'Customer phone number in format 010-1234-5678';
COMMENT ON COLUMN public.landing_leads.created_at IS 'Timestamp when the lead was submitted (Asia/Seoul timezone)';

-- Create a function to get leads from the last day (for export functionality)
CREATE OR REPLACE FUNCTION get_recent_leads(hours_back INTEGER DEFAULT 24)
RETURNS TABLE(id BIGINT, name VARCHAR, phone VARCHAR, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.name, l.phone, l.created_at
    FROM public.landing_leads l
    WHERE l.created_at >= NOW() - (hours_back || ' hours')::INTERVAL
    ORDER BY l.created_at DESC;
END;
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION get_recent_leads(INTEGER) TO service_role;