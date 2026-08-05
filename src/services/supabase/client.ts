import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

function validateEnvironmentVariables(): { url: string; anonKey: string } {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    throw new Error(
      '[Supabase Client Error]: Missing or invalid VITE_SUPABASE_URL environment variable. ' +
        'Please check your .env file and ensure VITE_SUPABASE_URL starts with http:// or https://.'
    );
  }

  if (!anonKey || typeof anonKey !== 'string' || anonKey.trim() === '') {
    throw new Error(
      '[Supabase Client Error]: Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
        'Please check your .env file and ensure VITE_SUPABASE_ANON_KEY is provided.'
    );
  }

  return { url, anonKey };
}

// Singleton instance wrapper
let supabaseInstance: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { url, anonKey } = validateEnvironmentVariables();

  // SSR-safe storage adapter fallback
  const isBrowser = typeof window !== 'undefined';
  const customAuthStorage = isBrowser ? window.localStorage : undefined;

  supabaseInstance = createClient<Database>(url, anonKey, {
    auth: {
      storage: customAuthStorage,
      autoRefreshToken: isBrowser,
      persistSession: isBrowser,
      detectSessionInUrl: isBrowser,
    },
  });

  return supabaseInstance;
}

// Typed singleton export for convenient application-wide usage
export const supabase = getSupabaseClient();
export type TypedSupabaseClient = SupabaseClient<Database>;
