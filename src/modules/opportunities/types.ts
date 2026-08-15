import type { ProductKey } from "@/config/site";

/**
 * Generic opportunity record. Deliberately not contracts-only: grants, permits
 * and other Nexudel surfaces reuse this shape via `productKey` + `recordType`.
 */
export type Opportunity = {
  id: string;
  productKey: ProductKey;
  recordType: "contract" | "grant" | "permit";
  title: string;
  agency: string;
  agencyId: string;
  office?: string;
  level: "Federal" | "State" | "Local";
  state: string;
  stateCode: string;
  city: string;
  postedDate: string;
  deadline: string;
  estimatedValue: number | null;
  naics: { code: string; label: string };
  psc?: { code: string; label: string };
  setAside: string;
  contractType: string;
  vehicle?: string;
  industry: string;
  clearance: "None" | "Public Trust" | "Secret" | "Top Secret";
  awardType: string;
  solicitationNumber: string;
  aiSummary: string;
  requirements: string[];
  eligibility: string[];
  timeline: { label: string; date: string }[];
  documents: { name: string; type: string; size: string }[];
  intelligence: {
    opportunityScore: number;
    fitScore: number;
    competition: "Low" | "Moderate" | "High";
    proposalComplexity: "Low" | "Moderate" | "High";
    risks: string[];
    nextSteps: string[];
  };
};

export type SortKey = "newest" | "deadline" | "value" | "relevance";

export type OpportunityFilters = {
  q: string;
  agencies: string[];
  states: string[];
  naics: string[];
  setAsides: string[];
  industries: string[];
  contractTypes: string[];
  clearances: string[];
  minValue: number | null;
  maxValue: number | null;
  postedWithinDays: number | null;
  deadlineWithinDays: number | null;
  sort: SortKey;
};

export const emptyFilters: OpportunityFilters = {
  q: "",
  agencies: [],
  states: [],
  naics: [],
  setAsides: [],
  industries: [],
  contractTypes: [],
  clearances: [],
  minValue: null,
  maxValue: null,
  postedWithinDays: null,
  deadlineWithinDays: null,
  sort: "relevance",
};
