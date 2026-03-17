import { supabase, isSupabaseConfigured } from "./client";
import type { Session, User } from "@supabase/supabase-js";

/** Prefer window.location.origin so auth redirects always match the current host. */
function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return "http://localhost:3000";
}

export async function signInWithMagicLink(email: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });
  return { error: error ? new Error(error.message) : null };
}

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });
  return { error: error ? new Error(error.message) : null };
}

export async function signInWithApple(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });
  return { error: error ? new Error(error.message) : null };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function onAuthStateChange(
  callback: (session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
