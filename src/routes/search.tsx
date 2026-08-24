import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { Filter, Mic, Search as SearchIcon, Sparkles, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdSlot } from "@/components/common/AdSlot";
import { PlaceholderNote } from "@/components/common/PlaceholderNote";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { buildFacets, filterOpportunities, smartParseQuery } from "@/modules/opportunities/query";
import { fetchOpportunities } from "@/modules/opportunities/remote";
import {
  emptyFilters,
  type Opportunity,
  type OpportunityFilters,
  type SortKey,
} from "@/modules/opportunities/types";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  sort: fallback(z.string(), "relevance").default("relevance"),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  loader: () => fetchOpportunities(),
  head: () =>
    seo({
      path: "/search",
      title: "Search Government Contracting Opportunities | GovScout",
      description:
        "Search federal, state and local contracting opportunities with advanced filters for agency, NAICS, set-aside, value and deadline.",
      ogTitle: "Search Government Contracting Opportunities",
      ogDescription: "Advanced procurement search with AI summaries and intelligent filters.",
    }),
  component: SearchPage,
});

type FacetKey = keyof ReturnType<typeof buildFacets>;

const facetFilterKey: Record<FacetKey, keyof OpportunityFilters> = {
  agencies: "agencies",
  states: "states",
  naics: "naics",
  setAsides: "setAsides",
  industries: "industries",
  contractTypes: "contractTypes",
  clearances: "clearances",
};

const facetLabels: Record<FacetKey, string> = {
  agencies: "Agency",
  states: "State",
  naics: "NAICS",
  setAsides: "Set-aside",
  industries: "Industry",
  contractTypes: "Contract type",
  clearances: "Security clearance",
};

function FilterPanel({
  filters,
  setFilters,
  records,
}: {
  filters: OpportunityFilters;
  setFilters: (f: OpportunityFilters) => void;
  records: Opportunity[];
}) {
  const facets = useMemo(() => buildFacets(records), [records]);

  const toggle = (key: keyof OpportunityFilters, value: string) => {
    const current = filters[key] as string[];
    setFilters({
      ...filters,
      [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  return (
    <div className="space-y-6">
      {(Object.keys(facets) as FacetKey[]).map((facet) => (
        <fieldset key={facet}>
          <legend className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {facetLabels[facet]}
          </legend>
          <div className="mt-3 space-y-2.5">
            {facets[facet].map((value) => {
              const key = facetFilterKey[facet];
              const id = `${facet}-${value}`;
              return (
                <div key={id} className="flex items-start gap-2.5">
                  <Checkbox
                    id={id}
                    checked={(filters[key] as string[]).includes(value)}
                    onCheckedChange={() => toggle(key, value)}
                  />
                  <Label htmlFor={id} className="text-sm font-normal leading-snug text-foreground">
                    {value}
                  </Label>
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <Separator />

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Contract value
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="min-value" className="text-xs text-muted-foreground">
              Minimum
            </Label>
            <input
              id="min-value"
              type="number"
              inputMode="numeric"
              placeholder="0"
              className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
              onChange={(e) =>
                setFilters({ ...filters, minValue: e.target.value ? +e.target.value : null })
              }
            />
          </div>
          <div>
            <Label htmlFor="max-value" className="text-xs text-muted-foreground">
              Maximum
            </Label>
            <input
              id="max-value"
              type="number"
              inputMode="numeric"
              placeholder="Any"
              className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
              onChange={(e) =>
                setFilters({ ...filters, maxValue: e.target.value ? +e.target.value : null })
              }
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Posted within
        </legend>
        <Select
          value={filters.postedWithinDays ? String(filters.postedWithinDays) : "any"}
          onValueChange={(v) =>
            setFilters({ ...filters, postedWithinDays: v === "any" ? null : Number(v) })
          }
        >
          <SelectTrigger className="mt-3" aria-label="Posted within">
            <SelectValue placeholder="Any time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Deadline within
        </legend>
        <Select
          value={filters.deadlineWithinDays ? String(filters.deadlineWithinDays) : "any"}
          onValueChange={(v) =>
            setFilters({ ...filters, deadlineWithinDays: v === "any" ? null : Number(v) })
          }
        >
          <SelectTrigger className="mt-3" aria-label="Deadline within">
            <SelectValue placeholder="Any deadline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any deadline</SelectItem>
            <SelectItem value="14">Next 14 days</SelectItem>
            <SelectItem value="30">Next 30 days</SelectItem>
            <SelectItem value="60">Next 60 days</SelectItem>
            <SelectItem value="120">Next 120 days</SelectItem>
          </SelectContent>
        </Select>
      </fieldset>

      <Button variant="outline" className="w-full" onClick={() => setFilters({ ...emptyFilters })}>
        <X aria-hidden="true" /> Clear all filters
      </Button>
    </div>
  );
}

function SearchPage() {
  const { q, sort } = Route.useSearch();
  const records = Route.useLoaderData();
  const navigate = useNavigate({ from: "/search" });
  const [filters, setFilters] = useState<OpportunityFilters>({
    ...emptyFilters,
    q,
    sort: (["newest", "deadline", "value", "relevance"].includes(sort)
      ? sort
      : "relevance") as SortKey,
  });
  const [term, setTerm] = useState(q);

  const results = useMemo(() => filterOpportunities(filters, records), [filters, records]);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const [listening, setListening] = useState(false);

  const runSmartSearch = (raw: string) => {
    const text = raw.trim();
    if (!text) {
      toast.info("Type a query first, e.g. “SDVOSB cybersecurity Virginia 541512”.");
      return;
    }
    const { filters: parsed, applied, q: leftover } = smartParseQuery(text, records);
    setTerm(leftover);
    setFilters({ ...emptyFilters, ...parsed, q: leftover });
    navigate({ search: (prev) => ({ ...prev, q: leftover }) });
    toast.success(
      applied.length
        ? `Applied ${applied.length} filter${applied.length > 1 ? "s" : ""}`
        : "Searched by keywords",
      { description: applied.length ? applied.join(" · ") : text },
    );
  };

  const startVoiceSearch = () => {
    type SpeechWindow = Window & {
      SpeechRecognition?: new () => never;
      webkitSpeechRecognition?: new () => never;
    };
    const w = window as SpeechWindow;
    const SpeechRecognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice search isn't supported in this browser.", {
        description: "Try Chrome or Edge, or type your query instead.",
      });
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition() as unknown as {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      start: () => void;
      stop: () => void;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onerror: () => void;
      onend: () => void;
    };
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (!transcript) return;
      setTerm(transcript);
      runSmartSearch(transcript);
    };
    recognition.onerror = () => {
      toast.error("Couldn't capture audio. Check microphone permissions.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    toast.info("Listening… speak your search.");
    recognition.start();
  };

  const activeCount =
    filters.agencies.length +
    filters.states.length +
    filters.naics.length +
    filters.setAsides.length +
    filters.industries.length +
    filters.contractTypes.length +
    filters.clearances.length;

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">Opportunity search</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Federal, state and local opportunities with AI summaries and procurement intelligence.
        </p>
      </div>

      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters({ ...filters, q: term });
          navigate({ search: (prev) => ({ ...prev, q: term }) });
        }}
        className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-subtle sm:flex-row sm:items-center"
      >
        <label htmlFor="search-input" className="sr-only">
          Search opportunities
        </label>
        <div className="relative flex-1">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="search-input"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Try “cybersecurity Virginia” or NAICS 541512"
            className="h-11 w-full rounded-xl border border-transparent bg-secondary/60 pl-10 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="accent" className="h-11">
            Search
          </Button>
          <Button
            type="button"
            variant={listening ? "accent" : "outline"}
            className="h-11"
            aria-label="Voice search"
            aria-pressed={listening}
            onClick={startVoiceSearch}
          >
            <Mic aria-hidden="true" />
            <span className="hidden sm:inline">{listening ? "Listening" : "Voice"}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => runSmartSearch(term)}
          >
            <Sparkles aria-hidden="true" />
            <span className="hidden sm:inline">AI search</span>
          </Button>
        </div>
      </form>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-subtle">
            <h2 className="mb-4 text-sm font-semibold">Filters</h2>
            <FilterPanel filters={filters} setFilters={setFilters} records={records} />
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              <span className="font-semibold text-foreground">{results.length}</span> opportunities
            </p>
            {activeCount > 0 ? (
              <Badge variant="secondary">{activeCount} filters active</Badge>
            ) : null}

            <div className="ml-auto flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter aria-hidden="true" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[90vw] max-w-sm overflow-y-auto">
                  <SheetTitle>Filters</SheetTitle>
                  <div className="mt-4">
                    <FilterPanel filters={filters} setFilters={setFilters} records={records} />
                  </div>
                </SheetContent>
              </Sheet>

              <Select
                value={filters.sort}
                onValueChange={(v) => setFilters({ ...filters, sort: v as SortKey })}
              >
                <SelectTrigger className="w-[170px]" aria-label="Sort results">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort: Relevance</SelectItem>
                  <SelectItem value="newest">Sort: Newest</SelectItem>
                  <SelectItem value="deadline">Sort: Deadline</SelectItem>
                  <SelectItem value="value">Sort: Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <PlaceholderNote className="mb-4">
            Sample dataset shown while live ingestion is being connected.
          </PlaceholderNote>

          <div className="space-y-4">
            {results.map((opportunity, i) => (
              <div key={opportunity.id} className="space-y-4">
                <OpportunityCard opportunity={opportunity} />
                {i === 2 ? <AdSlot /> : null}
              </div>
            ))}
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <h2 className="text-lg font-semibold">No opportunities match those filters</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try removing a filter or broadening your keywords.
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => setFilters({ ...emptyFilters })}
                >
                  Reset filters
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
