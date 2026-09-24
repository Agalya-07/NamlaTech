import { createClient } from '@supabase/supabase-js';

// ==============================================================================
// SUPABASE CLIENT INITIALIZATION
// Single shared instance for all frontend components and services.
// Credentials are read ONLY from environment variables (Vite format).
// ==============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase Setup]: Missing or placeholder Supabase credentials.\n' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env or .env.local file.\n' +
    'See .env.example for details.'
  );
}

// Fallback dummy credentials to prevent createClient from crashing the JS runtime if .env is missing during initial build
const clientUrl = supabaseUrl || 'https://placeholder.supabase.co';
const clientKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
