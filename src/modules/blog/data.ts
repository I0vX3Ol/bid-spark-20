export type BlogCategory =
  | "Federal Contracting"
  | "Small Business"
  | "SAM.gov"
  | "Proposal Writing"
  | "Procurement"
  | "Compliance"
  | "Industry News"
  | "Government Technology"
  | "Cybersecurity"
  | "Construction";

export const blogCategories: BlogCategory[] = [
  "Federal Contracting",
  "Small Business",
  "SAM.gov",
  "Proposal Writing",
  "Procurement",
  "Compliance",
  "Industry News",
  "Government Technology",
  "Cybersecurity",
  "Construction",
];

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  author: { name: string; role: string };
  publishedAt: string;
  readingMinutes: number;
  sections: { id: string; heading: string; body: string[] }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "sam-gov-registration-checklist",
    title: "The SAM.gov registration checklist for first-time federal bidders",
    description:
      "What you need before you register, the fields that most often cause rejections, and how to keep your entity active without last-minute renewals.",
    category: "SAM.gov",
    author: { name: "NexusDel Research Team", role: "Procurement research" },
    publishedAt: "2026-07-15",
    readingMinutes: 8,
    sections: [
      {
        id: "before-you-start",
        heading: "Before you start",
        body: [
          "Registration in SAM.gov is the gate to every federal award. Before creating an entity record, confirm your legal business name and physical address exactly match your IRS records and your bank's records. Mismatches are the single most common cause of validation delays.",
          "Gather your Taxpayer Identification Number, bank routing and account numbers for electronic funds transfer, and the name of the person who will serve as your Entity Administrator.",
        ],
      },
      {
        id: "entity-validation",
        heading: "Entity validation",
        body: [
          "Entity validation compares your submitted details against third-party records. If validation fails, you can submit documentation such as a business license or articles of incorporation. Submit documents that show the same name and address you entered, not a newer or abbreviated version.",
        ],
      },
      {
        id: "naics-and-psc",
        heading: "Choosing NAICS and PSC codes",
        body: [
          "Your primary NAICS code determines which small business size standard applies to you. Select the code that best represents the majority of your revenue, then add secondary codes for adjacent work you can credibly perform.",
          "Product and Service Codes describe what the government is buying rather than what your firm does. Tracking both improves the precision of your saved searches.",
        ],
      },
      {
        id: "staying-active",
        heading: "Staying active",
        body: [
          "Registrations expire annually. Set a reminder 60 days before expiration; an inactive registration makes you ineligible for award even if your proposal is otherwise the best value.",
        ],
      },
    ],
  },
  {
    slug: "reading-a-solicitation-fast",
    title: "How to read a solicitation in fifteen minutes and make a confident bid decision",
    description:
      "A repeatable triage method for capture teams: what to read first, which sections are pass/fail, and when to walk away early.",
    category: "Proposal Writing",
    author: { name: "NexusDel Research Team", role: "Procurement research" },
    publishedAt: "2026-06-28",
    readingMinutes: 10,
    sections: [
      {
        id: "start-with-section-m",
        heading: "Start with the evaluation criteria",
        body: [
          "Evaluation criteria tell you how the award decision will actually be made. Read them before the statement of work. If technical approach carries the most weight, your proposal plan looks very different than if price is the deciding factor.",
        ],
      },
      {
        id: "find-the-gates",
        heading: "Find the pass/fail gates",
        body: [
          "Certifications, clearances, licensing and registration requirements are usually binary. Identify them in the first pass. A missing facility clearance or an inactive set-aside certification eliminates a bid regardless of technical merit.",
        ],
      },
      {
        id: "check-the-calendar",
        heading: "Check the calendar honestly",
        body: [
          "Map every date: questions due, site visits, prequalification deadlines and submission. Prequalification deadlines that precede the proposal deadline are a frequent source of avoidable no-bids.",
        ],
      },
      {
        id: "decide",
        heading: "Make the decision explicit",
        body: [
          "Record a bid/no-bid decision with the reason. Over time this record becomes your best guide to where your win rate is real and where it is aspirational.",
        ],
      },
    ],
  },
  {
    slug: "set-aside-types-explained",
    title: "Set-aside types explained: which ones your business can actually use",
    description:
      "Small business, 8(a), HUBZone, SDVOSB and WOSB set-asides compared, including certification paths and common eligibility mistakes.",
    category: "Small Business",
    author: { name: "NexusDel Research Team", role: "Procurement research" },
    publishedAt: "2026-06-09",
    readingMinutes: 7,
    sections: [
      {
        id: "why-set-asides-matter",
        heading: "Why set-asides matter",
        body: [
          "Set-asides limit competition to a defined group of businesses. For a qualifying firm, they are the highest-leverage filter in the entire opportunity pipeline because they materially reduce the number of competitors.",
        ],
      },
      {
        id: "the-main-programs",
        heading: "The main programs",
        body: [
          "Small business set-asides use the SBA size standard tied to the solicitation's NAICS code. The 8(a) Business Development program, HUBZone, service-disabled veteran-owned and women-owned programs each add ownership, control or location requirements on top of size.",
        ],
      },
      {
        id: "common-mistakes",
        heading: "Common eligibility mistakes",
        body: [
          "Certification lapses, affiliation rules that aggregate revenue across related companies, and assuming a self-certification satisfies a program that requires formal certification are the three failures we see most often.",
        ],
      },
    ],
  },
  {
    slug: "cmmc-readiness-for-small-contractors",
    title: "CMMC readiness for small defense contractors",
    description:
      "A practical sequence for reaching Level 2 readiness without over-buying tooling, and how to document a credible remediation plan.",
    category: "Cybersecurity",
    author: { name: "NexusDel Research Team", role: "Procurement research" },
    publishedAt: "2026-05-21",
    readingMinutes: 9,
    sections: [
      {
        id: "scope-first",
        heading: "Scope before tooling",
        body: [
          "Define which systems handle controlled unclassified information before purchasing security products. A narrow, well-documented boundary is cheaper to secure and easier to assess than an enterprise-wide scope.",
        ],
      },
      {
        id: "assess",
        heading: "Assess against the practices",
        body: [
          "Score each practice honestly and record evidence locations. An accurate assessment with gaps is more useful than an optimistic one, because it drives the remediation plan you will be asked to produce.",
        ],
      },
      {
        id: "document",
        heading: "Document the plan",
        body: [
          "A system security plan and a plan of action with dated milestones show progress. Many solicitations accept a documented remediation plan where full certification is not yet required.",
        ],
      },
    ],
  },
];

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug) ?? null;
}

export function relatedPosts(post: BlogPost, limit = 3) {
  return blogPosts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, limit);
}
