import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://lvvcipyrlorjlddiugec.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dmNpcHlybG9yamxkZGl1Z2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MTAwNjIsImV4cCI6MjA3NjQ4NjA2Mn0.ayTsdRoa254VSTyiRnUhVhb6JPIDMgQCD4KXd2JYiy8"

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
