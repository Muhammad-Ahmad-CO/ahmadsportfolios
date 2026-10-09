import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Message Sent — Muhammad Ahmed" },
      { name: "description", content: "Thanks for reaching out to Muhammad Ahmed. Your message was received and you will get a reply by email soon." },
      { property: "og:title", content: "Message Sent — Muhammad Ahmed" },
      { property: "og:description", content: "Thanks for reaching out. Your message was received." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0C0C0C] px-6 text-[#D7E2EA]">
      <div className="max-w-lg text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 opacity-80" aria-hidden />
        <h1 className="hero-heading mt-6 text-4xl md:text-6xl font-black uppercase">Thank you!</h1>
        <p className="mt-5 text-lg opacity-80">Your message landed safely in my inbox. I'll get back to you by email soon.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-[#D7E2EA] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[#0C0C0C] hover:opacity-85">Back to Home</Link>
          <Link to="/portfolio" className="rounded-full border-2 border-[#D7E2EA] px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#D7E2EA] hover:text-[#0C0C0C]">View Projects</Link>
        </div>
      </div>
    </main>
  );
}
