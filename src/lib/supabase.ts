import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Safe wrapper around supabase.auth.getSession().
 * If the refresh token is invalid or expired, silently signs out
 * and returns null instead of throwing an uncaught error.
 */
export async function getSafeSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch {
    // Refresh token gone — clean up locally without a server round-trip
    try {
      // Remove tokens from storage without calling the server
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith("sb-") && k.includes("auth-token")
      );
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {
      // localStorage might be unavailable, ignore
    }
    return null;
  }
}