import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Lead {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone?: string
  website?: string
  industry?: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected'
  source?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface LeadInsert {
  company_name: string
  contact_name: string
  email: string
  phone?: string
  website?: string
  industry?: string
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected'
  source?: string
  notes?: string
}

// Database functions
export const getLeads = async (): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    throw error
  }

  return data || []
}

export const createLead = async (lead: LeadInsert): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .insert([lead])
    .select()
    .single()

  if (error) {
    console.error('Error creating lead:', error)
    throw error
  }

  return data
}

export const updateLead = async (id: string, updates: Partial<LeadInsert>): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating lead:', error)
    throw error
  }

  return data
}

export const deleteLead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting lead:', error)
    throw error
  }
} 