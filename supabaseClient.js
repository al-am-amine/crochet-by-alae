import { createClient } from '@supabase/supabase-js'

// These come from your Supabase project settings (Project Settings -> API).
// They are read from environment variables so the real keys never get
// committed to GitHub — see .env.example.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
