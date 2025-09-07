import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing. Please ensure Supabase is properly connected.')
  console.log('Expected variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  console.log('Current values:', { supabaseUrl, supabaseAnonKey })
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)