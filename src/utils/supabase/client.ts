import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

// Singleton pattern to ensure only one client instance
let supabaseInstance: SupabaseClient | null = null

// Create a single Supabase client instance to be shared across the app
export const supabase = (() => {
  if (!supabaseInstance) {
    console.log('🔧 Creating new Supabase client instance')
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          storageKey: 'propertyflow-auth',
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        },
        global: {
          headers: {
            'X-Client-Info': 'propertyflow-web'
          }
        }
      }
    )
  } else {
    console.log('🔧 Reusing existing Supabase client instance')
  }
  return supabaseInstance
})()

// Export the client as default as well for convenience
export default supabase
