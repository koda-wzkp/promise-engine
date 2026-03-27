/**
 * Supabase Client — Lazy-loaded to avoid build errors when @supabase/supabase-js
 * is not installed. The package is optional; team features gracefully degrade.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  "";

/** Returns true when Supabase env vars are configured. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

let _supabase: any = null;
let _loadAttempted = false;

/**
 * Get the Supabase client. Returns null if the library isn't installed
 * or env vars aren't configured.
 */
export async function getSupabase(): Promise<any> {
  if (_supabase) return _supabase;
  if (_loadAttempted) return null;
  if (!isSupabaseConfigured()) return null;

  _loadAttempted = true;
  try {
    // Use Function constructor to avoid webpack static analysis
    const dynamicImport = new Function("specifier", "return import(specifier)");
    const mod = await dynamicImport("@supabase/supabase-js");
    _supabase = mod.createClient(supabaseUrl, supabaseAnonKey);
    return _supabase;
  } catch {
    return null;
  }
}
