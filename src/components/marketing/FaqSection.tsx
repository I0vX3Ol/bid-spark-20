import { SectionHeading } from "@/components/common/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    q: "Where does the opportunity data come from?",
    a: "Nexudel aggregates publicly available procurement records from federal, state and local sources, normalizes them into a single schema, and enriches each record with AI analysis. Every record links back to its originating source.",
  },
  {
    q: "How accurate are the AI summaries?",
    a: "Summaries are generated from the official solicitation text and are designed to speed up triage, not replace it. Every summary is shown next to the source documents so your team can verify before making a bid decision.",
  },
  {
    q: "Can I get alerted when new opportunities match my criteria?",
    a: "Yes. Save any search and choose real-time, daily or weekly delivery. Professional plans also include deadline reminders and agency update notifications.",
  },
  {
    q: "Do you support state and local opportunities?",
    a: "Yes. Coverage spans federal, state and local sources, and each record is tagged with its jurisdiction level so you can filter precisely.",
  },
  {
    q: "Can my whole team use one account?",
    a: "Professional is licensed per user. Enterprise adds shared team workspaces, role-based access, SSO and audit logs.",
  },
  {
    q: "Is there an API?",
    a: "API access and scheduled data delivery are included with Enterprise plans. Documentation is available in the developer docs.",
  },
];

export function FaqSection() {
  return (
    <section className="container-page py-20">
      <SectionHeading eyebrow="FAQ" title="Questions, answered" />
      <div className="mx-auto mt-10 max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
