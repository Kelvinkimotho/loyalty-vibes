import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mtsdliquavtbwrkjtiou.supabase.co'
const supabaseKey = 'vvvvv'

export const supabase = createClient(supabaseUrl, supabaseKey)
