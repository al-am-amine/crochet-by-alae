import { createClient } from '@supabase/supabase-js'

// Prefer Netlify environment variables. The fallback uses only Supabase's
// browser-safe anon key, protected by the database's RLS policies, so the
// static storefront can still mount if a deployment omits build variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ikgxaxanhxgnsadkawuz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZ3hheGFuaHhnbnNhZGthd3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMjA4OTQsImV4cCI6MjEwMTc5Njg5NH0.fX0nW24cnJ7JhmlyGjzoX6Omd4EZma3aNL-WPKsmuDc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
