import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

const clientUrl = supabaseUrl || 'https://placeholder.supabase.co';
const clientKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
