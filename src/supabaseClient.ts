import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nqmamkvlvcusaxuyxhmf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xbWFta3ZsdmN1c2F4dXl4aG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzAzNDIsImV4cCI6MjA2ODg0NjM0Mn0.bfJnHnDsfVkabP666wfMXIABWPH2SuP3ZJdg3xrdoBA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
