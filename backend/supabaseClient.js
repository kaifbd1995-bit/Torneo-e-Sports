import { createClient } from '@supabase/supabase-js'

// Legge le variabili d'ambiente definite nel file .env
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

// Inizializza il client di Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)