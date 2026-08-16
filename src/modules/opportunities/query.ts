import { sampleOpportunities } from "./data";
import type { Opportunity, OpportunityFilters } from "./types";

/** Facet values derived from the dataset so filters stay data-driven. */
export function buildFacets(records: Opportunity[] = sampleOpportunities) {
  const uniq = (values: string[]) => Array.from(new Set(values)).sort();
  return {
    agencies: uniq(records.map((r) => r.agency)),
    states: uniq(records.map((r) => r.state)),
    naics: uniq(records.map((r) => `${r.naics.code} — ${r.naics.label}`)),
    setAsides: uniq(records.map((r) => r.setAside)),
    industries: uniq(records.map((r) => r.industry)),
    contractTypes: uniq(records.map((r) => r.contractType)),
    clearances: uniq(records.map((r) => r.clearance)),
  };
}

function matchesText(record: Opportunity, q: string) {
  if (!q.trim()) return true;
  const haystack = [
    record.title,
    record.agency,
    record.office ?? "",
    record.state,
    record.city,
    record.industry,
    record.naics.code,
    record.naics.label,
    record.setAside,
    record.aiSummary,
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function within(days: number | null, iso: string, direction: "past" | "future") {
  if (days === null) return true;
  const diff = (new Date(iso).getTime() - Date.now()) / 86_400_000;
  return direction === "past" ? -diff <= days : diff >= 0 && diff <= days;
}

export function filterOpportunities(
  filters: OpportunityFilters,
  records: Opportunity[] = sampleOpportunities,
): Opportunity[] {
  const result = records.filter((r) => {
    if (!matchesText(r, filters.q)) return false;
    if (filters.agencies.length && !filters.agencies.includes(r.agency)) return false;
    if (filters.states.length && !filters.states.includes(r.state)) return false;
    if (filters.naics.length && !filters.naics.some((n) => n.startsWith(r.naics.code)))
      return false;
    if (filters.setAsides.length && !filters.setAsides.includes(r.setAside)) return false;
    if (filters.industries.length && !filters.industries.includes(r.industry)) return false;
    if (filters.contractTypes.length && !filters.contractTypes.includes(r.contractType))
      return false;
    if (filters.clearances.length && !filters.clearances.includes(r.clearance)) return false;
    if (filters.minValue !== null && (r.estimatedValue ?? 0) < filters.minValue) return false;
    if (filters.maxValue !== null && (r.estimatedValue ?? 0) > filters.maxValue) return false;
    if (!within(filters.postedWithinDays, r.postedDate, "past")) return false;
    if (!within(filters.deadlineWithinDays, r.deadline, "future")) return false;
    return true;
  });

  const sorted = [...result];
  switch (filters.sort) {
    case "newest":
      sorted.sort((a, b) => +new Date(b.postedDate) - +new Date(a.postedDate));
      break;
    case "deadline":
      sorted.sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));
      break;
    case "value":
      sorted.sort((a, b) => (b.estimatedValue ?? 0) - (a.estimatedValue ?? 0));
      break;
    default:
      sorted.sort((a, b) => b.intelligence.opportunityScore - a.intelligence.opportunityScore);
  }
  return sorted;
}

/**
 * Local natural-language query parser. Extracts recognized states, NAICS codes,
 * set-asides and clearances from a free-text query and returns partial filters
 * plus the leftover keywords. Runs entirely client-side — no model call, no keys.
 */
export function smartParseQuery(
  query: string,
  records: Opportunity[] = sampleOpportunities,
): { filters: Partial<OpportunityFilters>; applied: string[]; q: string } {
  const facets = buildFacets(records);
  const lower = query.toLowerCase();
  const applied: string[] = [];
  let remaining = ` ${lower} `;

  const consume = (needle: string) => {
    remaining = remaining.replace(` ${needle.toLowerCase()} `, " ");
  };

  const states = facets.states.filter((s) => lower.includes(s.toLowerCase()));
  states.forEach((s) => {
    consume(s);
    applied.push(`State: ${s}`);
  });

  const naicsCodes = Array.from(query.matchAll(/\b(\d{6})\b/g)).map((m) => m[1] ?? "");
  const naics = facets.naics.filter((n) => naicsCodes.some((code) => n.startsWith(code)));
  naics.forEach((n) => {
    const code = n.split(" — ")[0] ?? n;
    consume(code);
    applied.push(`NAICS: ${code}`);
  });

  const setAsides = facets.setAsides.filter(
    (sa) => sa !== "None" && lower.includes(sa.toLowerCase()),
  );
  setAsides.forEach((sa) => {
    consume(sa);
    applied.push(`Set-aside: ${sa}`);
  });

  const clearances = facets.clearances.filter(
    (c) => c !== "None" && lower.includes(c.toLowerCase()),
  );
  clearances.forEach((c) => {
    consume(c);
    applied.push(`Clearance: ${c}`);
  });

  const filters: Partial<OpportunityFilters> = {};
  if (states.length) filters.states = states;
  if (naics.length) filters.naics = naics;
  if (setAsides.length) filters.setAsides = setAsides;
  if (clearances.length) filters.clearances = clearances;

  return { filters, applied, q: remaining.replace(/\s+/g, " ").trim() };
}

export function getOpportunity(id: string, records: Opportunity[] = sampleOpportunities) {
  return records.find((r) => r.id === id) ?? null;
}

export function similarOpportunities(
  record: Opportunity,
  limit = 3,
  records: Opportunity[] = sampleOpportunities,
) {
  return records
    .filter((r) => r.id !== record.id)
    .map((r) => ({
      r,
      score:
        (r.industry === record.industry ? 3 : 0) +
        (r.agency === record.agency ? 2 : 0) +
        (r.naics.code === record.naics.code ? 2 : 0) +
        (r.state === record.state ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.r);
}
