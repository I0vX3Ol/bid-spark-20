import { createClient } from "@supabase/supabase-js";
import { APP_KEY } from "@/lib/plans";

const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const key = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

// Fail with a sentence that names the problem. This used to warn and then call
// createClient("", "") — which throws "supabaseUrl is required" from inside the
// library, three frames deep in a module graph, with nothing pointing at the
// missing binding. The warning was never the thing anyone saw.
if (!url || !key) {
  const missing = [!url && "VITE_SUPABASE_URL", !key && "VITE_SUPABASE_ANON_KEY"]
    .filter(Boolean)
    .join(" and ");
  throw new Error(
    `Supabase is not configured: ${missing} is not set. ` +
      "These are build-time variables — set them in .env for local development, " +
      "and as GitHub Actions secrets for a deploy. Nothing in the app can " +
      "authenticate or read data without them.",
  );
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// APP_KEY lives in @/lib/plans and is re-exported here for the auth and data
// callers that already import from this module. It was previously declared in
// both files, which is one definition too many for the value that decides which
// tenant's schema a row belongs to.
export { APP_KEY };
