import { createClient } from "@supabase/supabase-js";

const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
const key = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined;

if (!url || !key) {
  console.warn(
    "Supabase env vars are missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Auth calls will fail.",
  );
}

export const supabase = createClient(url ?? "", key ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Tag every signup so the shared Postgres project routes the new row into the right schema. */
export const APP_KEY = "govscout";
