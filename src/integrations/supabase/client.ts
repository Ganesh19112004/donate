// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * ✅ Custom Supabase client that DOES NOT auto-manage sessions
 * Because you use your own manual login (custom tables + localStorage),
 * we must disable Supabase Auth auto refresh / storage.
 */
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      // ❌ Turn off Supabase Auth session handling
      persistSession: false,
      autoRefreshToken: false,
      storageKey: "supabase-temp", // separate key to avoid clashes
    },
    global: {
      headers: {
        "x-application-name": "DenaSetu",
      },
    },
  }
);
