import 'dotenv/config'
import { supabase } from './supabaseClient.js'

async function checkConnection() {
  const { data, error } = await supabase.from('utenti').select('*')
  if (error) {
    console.error(' Errore di connessione a Supabase:', error.message)
  } else {
    console.log(' Connessione riuscita! Dati ricevuti dal DB:', data)
  }
}
checkConnection()