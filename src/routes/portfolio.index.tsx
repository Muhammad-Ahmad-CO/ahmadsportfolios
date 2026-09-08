import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { PROJECTS } from "@/data/projects";

const OG_IMAGE =
  "https://ahmadsportfolios.lovable.app/__l5e/assets-v1/aa312427-1156-4d89-b0c4-deef4309bf2d/og-portfolio.jpg";
const TITLE = "Portfolio — Muhammad Ahmed | AI Specialist & Web Developer";
const DESC =
  "Detailed case studies of seven live projects by Muhammad Ahmed — WebGL studios, e-commerce, climate tech and restaurant sites, with images and galleries.";

export const Route = createFileRoute("/portfolio/")({
  component: PortfolioPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ahmadsportfolios.lovable.app/portfolio" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: "https://ahmadsportfolios.lovable.app/portfolio" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESC,
          url: "https://ahmadsportfolios.lovable.app/portfolio",
          hasPart: PROJECTS.map((p) => ({
            "@type": "CreativeWork",
            name: p.name,
            url: `https://ahmadsportfolios.lovable.app/portfolio/${p.slug}`,
          })),
        }),
      },
    ],
  }),
});

function PortfolioPage() {
  return (
    <main className="min-h-screen bg-[#0C0C0C] px-5 sm:px-8 md:px-12 pt-10 pb-28 text-[#D7E2EA]">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider opacity-70 transition-opacity hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>

      <header className="mt-10 md:mt-16 max-w-4xl">
        <h1
          className="hero-heading font-black uppercase tracking-tight"
          style={{ fontSize: "clamp(2.5rem, 10vw, 130px)" }}
        >
          Portfolio
        </h1>
        <p className="mt-6 text-sm md:text-lg leading-relaxed opacity-70">
          Seven live products — from WebGL-driven studio sites to e-commerce, climate tech and
          local restaurants. Each case study includes the brief, what was built and a gallery
          from the live site.
        </p>
      </header>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {PROJECTS.map((p, i) => (
          <motion.article
            key={p.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group flex flex-col overflow-hidden rounded-3xl border border-white/12 bg-white/[0.02]"
          >
            <Link to="/portfolio/$slug" params={{ slug: p.slug }} className="block">
              <div className="keep-color overflow-hidden">
                <img
                  src={p.img}
                  alt={`${p.name} website preview`}
                  loading="lazy"
                  className="h-52 w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </Link>
            <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
              <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-wider opacity-55">
                <span>{p.n}</span>
                <span>{p.category}</span>
                <span>{p.year}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-medium uppercase leading-tight">
                <Link to="/portfolio/$slug" params={{ slug: p.slug }} className="hover:underline">
                  {p.name}
                </Link>
              </h2>
              <p className="text-sm leading-relaxed opacity-70">{p.desc}</p>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/portfolio/$slug"
                  params={{ slug: p.slug }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D7E2EA]/60 px-4 py-2 text-xs uppercase tracking-wider transition-colors hover:bg-[#D7E2EA] hover:text-[#0C0C0C]"
                >
                  Case study
                </Link>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-wider opacity-70 hover:opacity-100"
                >
                  Live site <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </main>
  );
}
