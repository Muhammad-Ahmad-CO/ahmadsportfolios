import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Privacy Policy — Muhammad Ahmed";
const DESC =
  "Privacy policy for Muhammad Ahmed's AI specialist and web developer portfolio: what the contact form collects, why, how long it is kept and how to request deletion.";
const URL = "https://ahmadsportfolios.lovable.app/privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0C0C0C] px-6 py-16 text-[#D7E2EA]">
      <article className="mx-auto max-w-2xl space-y-6 leading-relaxed">
        <Link to="/" className="text-sm uppercase tracking-wider opacity-60 hover:opacity-100">← Back home</Link>
        <h1 className="hero-heading text-4xl md:text-5xl font-black uppercase">Privacy Policy</h1>
        <p className="opacity-60 text-sm">Last updated: October 2026</p>
        <h2 className="text-xl font-semibold">What the contact form collects</h2>
        <p className="opacity-80">When you use the “Get in touch” form, I collect your name, email address, an optional subject and your message. Nothing else is required.</p>
        <h2 className="text-xl font-semibold">How it is used</h2>
        <p className="opacity-80">Your details are used only to read and reply to your enquiry. Messages are stored securely and forwarded to my inbox by email. They are never sold, shared for marketing or added to a mailing list.</p>
        <h2 className="text-xl font-semibold">Analytics</h2>
        <p className="opacity-80">This site uses Google Analytics to understand anonymous visit statistics such as pages viewed and device type. Google may set cookies for this purpose.</p>
        <h2 className="text-xl font-semibold">Retention and your rights</h2>
        <p className="opacity-80">You can ask to see or delete your message at any time by emailing <a className="underline" href="mailto:kaim953@gmail.com">kaim953@gmail.com</a>.</p>
      </article>
    </main>
  );
}
