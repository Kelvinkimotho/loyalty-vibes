import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mtsdliquavtbwrkjtiou.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c2RsaXF1YXZ0Yndya2p0aW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNjUxNTgsImV4cCI6MjA2Mzc0MTE1OH0.Pv3zzsE9x2eU4bRGmyWwpnPgI1UyJ3rWVKVnGjfrldM'

export const supabase = createClient(supabaseUrl, supabaseKey)
