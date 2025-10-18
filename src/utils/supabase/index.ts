// Re-export the singleton Supabase client
export { supabase, default } from './client'

// Re-export types for convenience
export type { SupabaseClient, Session, User as SupabaseUser } from '@supabase/supabase-js'

// Export project info if needed elsewhere
export { projectId, publicAnonKey } from './info'