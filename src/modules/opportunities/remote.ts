import { supabase } from "@/lib/supabase";
import type { Opportunity } from "./types";

/** Raw shape returned by the `public.govscout_opportunities` view (snake_case Postgres columns). */
type OpportunityRow = {
  id: string;
  product_key: Opportunity["productKey"];
  record_type: Opportunity["recordType"];
  title: string;
  agency: string;
  agency_id: string;
  office: string | null;
  level: Opportunity["level"];
  state: string;
  state_code: string;
  city: string;
  posted_date: string;
  deadline: string;
  estimated_value: number | null;
  naics: Opportunity["naics"];
  psc: Opportunity["psc"] | null;
  set_aside: string;
  contract_type: string;
  vehicle: string | null;
  industry: string;
  clearance: Opportunity["clearance"];
  award_type: string;
  solicitation_number: string;
  ai_summary: string;
  requirements: Opportunity["requirements"];
  eligibility: Opportunity["eligibility"];
  timeline: Opportunity["timeline"];
  documents: Opportunity["documents"];
  intelligence: Opportunity["intelligence"];
};

function toOpportunity(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    productKey: row.product_key,
    recordType: row.record_type,
    title: row.title,
    agency: row.agency,
    agencyId: row.agency_id,
    ...(row.office ? { office: row.office } : {}),
    level: row.level,
    state: row.state,
    stateCode: row.state_code,
    city: row.city,
    postedDate: row.posted_date,
    deadline: row.deadline,
    estimatedValue: row.estimated_value,
    naics: row.naics,
    ...(row.psc ? { psc: row.psc } : {}),
    setAside: row.set_aside,
    contractType: row.contract_type,
    ...(row.vehicle ? { vehicle: row.vehicle } : {}),
    industry: row.industry,
    clearance: row.clearance,
    awardType: row.award_type,
    solicitationNumber: row.solicitation_number,
    aiSummary: row.ai_summary,
    requirements: row.requirements ?? [],
    eligibility: row.eligibility ?? [],
    timeline: row.timeline ?? [],
    documents: row.documents ?? [],
    intelligence: row.intelligence,
  };
}

/**
 * Cache of the public opportunity list.
 *
 * On the server this module lives for the lifetime of a Worker isolate, so this
 * is shared across every request that isolate serves. That is only safe because
 * `govscout_opportunities` is public — RLS grants `select` on it to everyone,
 * so there are no per-caller rows to leak. **Nothing user-scoped may be cached
 * here.** The per-user readers below deliberately query on every call.
 */
let publicOpportunityCache: { records: Opportunity[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

/**
 * Fetch live opportunities from Supabase.
 *
 * Returns an empty list if the query fails, and the caller renders an empty
 * state. It does not substitute sample data: showing invented contract
 * opportunities to somebody deciding what to bid on would be worse than showing
 * them nothing.
 */
export async function fetchOpportunities(): Promise<Opportunity[]> {
  if (publicOpportunityCache && Date.now() - publicOpportunityCache.fetchedAt < CACHE_TTL_MS) {
    return publicOpportunityCache.records;
  }
  const { data, error } = await supabase
    .from("govscout_opportunities")
    .select("*")
    .order("posted_date", { ascending: false });

  if (error) {
    console.error("Failed to load opportunities:", error.message);
    return [];
  }
  if (!data || data.length === 0) return [];

  const records = (data as OpportunityRow[]).map(toOpportunity);
  publicOpportunityCache = { records, fetchedAt: Date.now() };
  return records;
}

/* ---------------------------------------------------------------------------
 * Per-user workspace data: saved searches, bookmarks, profile and the public
 * contact form. Everything below is scoped by row-level security to the
 * signed-in user.
 * ------------------------------------------------------------------------- */

type GsRow = Record<string, unknown>;

export type SavedSearch = {
  id: string;
  name: string;
  query: Record<string, unknown>;
  alertFrequency: string;
  createdAt: string;
};

export async function fetchSavedSearches(): Promise<SavedSearch[]> {
  const { data, error } = await supabase
    .from("govscout_saved_searches")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load saved searches:", error.message);
    return [];
  }
  return ((data ?? []) as GsRow[]).map((r) => ({
    id: String(r["id"]),
    name: String(r["name"] ?? ""),
    query: (r["query"] as Record<string, unknown>) ?? {},
    alertFrequency: String(r["alert_frequency"] ?? "none"),
    createdAt: String(r["created_at"]),
  }));
}

export async function createSavedSearch(
  name: string,
  query: Record<string, unknown>,
  alertFrequency = "none",
) {
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) throw new Error("You need to be signed in to save a search.");
  const { error } = await supabase
    .from("govscout_saved_searches")
    .insert({ user_id: me.user.id, name, query, alert_frequency: alertFrequency });
  if (error) throw error;
}

export async function deleteSavedSearch(id: string) {
  const { error } = await supabase.from("govscout_saved_searches").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchBookmarks(): Promise<string[]> {
  const { data, error } = await supabase
    .from("govscout_bookmarks")
    .select("opportunity_id")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load bookmarks:", error.message);
    return [];
  }
  return ((data ?? []) as GsRow[]).map((r) => String(r["opportunity_id"]));
}

export async function addBookmark(opportunityId: string) {
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) throw new Error("You need to be signed in to bookmark an opportunity.");
  const { error } = await supabase
    .from("govscout_bookmarks")
    .insert({ user_id: me.user.id, opportunity_id: opportunityId });
  if (error) throw error;
}

export async function removeBookmark(opportunityId: string) {
  const { error } = await supabase
    .from("govscout_bookmarks")
    .delete()
    .eq("opportunity_id", opportunityId);
  if (error) throw error;
}

export type GovProfile = {
  id: string;
  email: string;
  fullName: string;
  company: string;
  plan: string;
  naicsCodes: string;
  setAsides: string;
  states: string;
  notificationPrefs: Record<string, boolean>;
};

export async function fetchProfile(): Promise<GovProfile | null> {
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return null;

  // Filtered explicitly as well as by RLS. RLS is what enforces this, but a
  // reader that says which row it wants cannot silently start returning
  // somebody else's if a policy is ever loosened.
  let row = await supabase.from("govscout_profiles").select("*").eq("id", me.user.id).maybeSingle();

  // Profiles are created by the on_auth_user_created trigger, which keys off
  // the `app` value in the signup metadata. A user who arrived without it —
  // an OAuth flow, an invite, a hand-created account — ends up with no row at
  // all and a settings page that silently shows nothing. Create it on demand;
  // `profiles: insert own` allows exactly this and nothing more.
  if (!row.error && !row.data) {
    await supabase.from("govscout_profiles").insert({ id: me.user.id, email: me.user.email ?? "" });
    row = await supabase.from("govscout_profiles").select("*").eq("id", me.user.id).maybeSingle();
  }

  const { data, error } = row;
  if (error || !data) return null;
  const r = data as GsRow;
  return {
    id: String(r["id"]),
    email: String(r["email"] ?? ""),
    fullName: String(r["full_name"] ?? ""),
    company: String(r["company"] ?? ""),
    plan: String(r["plan"] ?? "free"),
    naicsCodes: String(r["naics_codes"] ?? ""),
    setAsides: String(r["set_asides"] ?? ""),
    states: String(r["states"] ?? ""),
    notificationPrefs: (r["notification_prefs"] as Record<string, boolean>) ?? {},
  };
}

/**
 * Columns a user may change on their own profile.
 *
 * `plan` is deliberately absent. RLS lets someone update any column of their
 * own row, so an unrestricted patch let the client set its own plan. Nothing
 * gates on `profiles.plan` today — entitlement is read from
 * `govscout_subscriptions`, which only the Stripe webhook's service role can
 * write — but a whitelist here means that stays true even if some later screen
 * starts trusting it. `id` and `email` are owned by auth, not by this form.
 */
const EDITABLE_PROFILE_COLUMNS = [
  "full_name",
  "company",
  "naics_codes",
  "set_asides",
  "states",
  "notification_prefs",
] as const;

export type ProfilePatch = Partial<Record<(typeof EDITABLE_PROFILE_COLUMNS)[number], unknown>>;

export async function updateProfile(patch: ProfilePatch) {
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) throw new Error("You need to be signed in.");

  // Filtered at runtime, not just in the type — the type is erased at build and
  // this is the part that actually holds.
  const safe = Object.fromEntries(
    Object.entries(patch).filter(([column]) =>
      (EDITABLE_PROFILE_COLUMNS as readonly string[]).includes(column),
    ),
  );

  if (Object.keys(safe).length === 0) return;

  const { error } = await supabase.from("govscout_profiles").update(safe).eq("id", me.user.id);
  if (error) throw error;
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  topic?: string;
  message: string;
}) {
  const { data: me } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("govscout_contact_messages")
    .insert({ ...input, user_id: me.user?.id ?? null });
  if (error) throw error;
}
