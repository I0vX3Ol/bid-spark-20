import { supabase } from "@/lib/supabase";
import { sampleOpportunities } from "./data";
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

let cache: { records: Opportunity[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

/**
 * Fetch live opportunities from Supabase. Falls back to the bundled sample
 * dataset if the request fails or returns nothing (e.g. missing env vars in
 * a local dev environment, or a transient network error) so the search page
 * never renders empty.
 */
export async function fetchOpportunities(): Promise<Opportunity[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.records;
  }
  const { data, error } = await supabase
    .from("govscout_opportunities")
    .select("*")
    .order("posted_date", { ascending: false });

  if (error || !data || data.length === 0) {
    if (error) console.warn("Falling back to sample opportunities:", error.message);
    return sampleOpportunities;
  }

  const records = (data as OpportunityRow[]).map(toOpportunity);
  cache = { records, fetchedAt: Date.now() };
  return records;
}
