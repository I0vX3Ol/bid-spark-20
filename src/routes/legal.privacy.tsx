import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | GovScout" },
      {
        name: "description",
        content:
          "How GovScout collects, uses, stores and protects personal information for account holders and site visitors.",
      },
      { property: "og:title", content: "GovScout Privacy Policy" },
      { property: "og:description", content: "Our approach to personal data and privacy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    heading: "Information we collect",
    body: "Account details you provide (name, work email, company), product usage such as searches and saved records, and standard technical data including IP address and device information.",
  },
  {
    heading: "How we use information",
    body: "To operate the platform, deliver alerts you configure, provide support, secure the service, and improve search and analysis quality.",
  },
  {
    heading: "Sharing",
    body: "We do not sell personal information. We share data with processors that operate the service under contract, and where required by law.",
  },
  {
    heading: "Retention",
    body: "Account data is retained while your account is active and for a limited period afterwards to meet legal and accounting obligations.",
  },
  {
    heading: "Your rights",
    body: "You may request access, correction, export or deletion of your personal information from account settings or by contacting support.",
  },
  {
    heading: "Contact",
    body: "Privacy questions can be directed to our team through the contact page.",
  },
];

function PrivacyPage() {
  return (
    <div className="container-page py-16">
      <div className="max-w-[68ch]">
        <h1 className="text-3xl font-semibold sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This summary describes our privacy practices in plain language. It is provided as a
          starting template and should be reviewed by counsel before launch.
        </p>
        {sections.map((s) => (
          <section key={s.heading} className="mt-10">
            <h2 className="text-xl font-semibold">{s.heading}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
