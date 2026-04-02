import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Graceful fallback: only create a real client if valid URL is provided.
// Otherwise create a dummy client that will fail on calls (caught by try/catch in utils).
function createSafeClient(): SupabaseClient {
  try {
    if (
      supabaseUrl &&
      supabaseUrl !== "YOUR_SUPABASE_URL" &&
      supabaseUrl.startsWith("http")
    ) {
      return createClient(supabaseUrl, supabaseAnonKey);
    }
  } catch {
    // Supabase creation failed — fall through to proxy
  }

  // Return a proxy that silently fails on any operation
  return new Proxy({} as SupabaseClient, {
    get: () => {
      return (..._args: unknown[]) => {
        return {
          select: () => ({ data: null, error: { message: "Supabase not configured" } }),
          insert: () => ({ data: null, error: { message: "Supabase not configured" } }),
          eq: function(this: unknown) { return this; },
          order: function(this: unknown) { return this; },
          single: () => ({ data: null, error: { message: "Supabase not configured" } }),
          data: null,
          error: { message: "Supabase not configured" },
        };
      };
    },
  });
}

export const supabase = createSafeClient();
