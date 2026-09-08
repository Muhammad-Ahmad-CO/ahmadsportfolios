import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PROJECTS, getProject } from "@/data/projects";

const BASE = "https://ahmadsportfolios.lovable.app";
const OG_IMAGE = `${BASE}/__l5e/assets-v1/aa312427-1156-4d89-b0c4-deef4309bf2d/og-portfolio.jpg`;

export const Route = createFileRoute("/portfolio/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return project;
  },
  component: ProjectPage,
  head: ({ params, loaderData }) => {
    const name = loaderData?.name ?? "Project";
    const desc = loaderData?.desc ?? "Project case study by Muhammad Ahmed.";
    const title = `${name} — ${loaderData?.category ?? "Case Study"} | Muhammad Ahmed`;
    const url = `${BASE}/portfolio/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: OG_IMAGE },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: OG_IMAGE },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name,
            description: desc,
            url,
            author: { "@type": "Person", name: "Muhammad Ahmed" },
          }),
        },
      ],
    };
  },
});

function ProjectPage() {
  const p = Route.useLoaderData();
  const others = PROJECTS.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#0C0C0C] px-5 sm:px-8 md:px-12 pt-10 pb-28 text-[#D7E2EA]">
      <Link
        to="/portfolio"
        className="inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider opacity-70 transition-opacity hover:opacity-100"
      >
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 md:mt-14 max-w-4xl"
      >
        <div className="flex flex-wrap items-center gap-3 text-[0.7rem] uppercase tracking-wider opacity-55">
          <span>{p.n}</span>
          <span>{p.category}</span>
          <span>{p.year}</span>
          <span>{p.role}</span>
        </div>
        <h1
          className="hero-heading mt-4 font-black uppercase tracking-tight"
          style={{ fontSize: "clamp(2.2rem, 8vw, 96px)" }}
        >
          {p.name}
        </h1>
        <p className="mt-6 text-sm md:text-lg leading-relaxed opacity-75">{p.desc}</p>
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-5 py-2.5 text-xs md:text-sm uppercase tracking-wider transition-colors hover:bg-[#D7E2EA] hover:text-[#0C0C0C]"
        >
          Visit live site
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
        </a>
      </motion.header>

      <div className="keep-color mt-12 overflow-hidden rounded-3xl border border-white/12">
        <img
          src={p.img}
          alt={`${p.name} homepage`}
          width={1280}
          height={800}
          className="w-full object-cover object-top"
        />
      </div>

      <section className="mt-16 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2 space-y-5">
          <h2 className="text-xl md:text-2xl font-medium uppercase">Overview</h2>
          <p className="text-sm md:text-base leading-relaxed opacity-75">{p.overview}</p>
          <ul className="space-y-3 pt-2">
            {p.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-sm md:text-base opacity-75">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D7E2EA]/70" />
                {h}
              </li>
            ))}
          </ul>
        </div>
        <aside className="space-y-6 rounded-3xl border border-white/12 bg-white/[0.02] p-6">
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-wider opacity-50">Role</h3>
            <p className="mt-1 text-sm">{p.role}</p>
          </div>
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-wider opacity-50">Year</h3>
            <p className="mt-1 text-sm">{p.year}</p>
          </div>
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-wider opacity-50">Built with</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-white/15 px-3 py-1 text-[0.65rem] uppercase tracking-wider opacity-75"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-20">
        <h2 className="text-xl md:text-2xl font-medium uppercase">Gallery</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {[p.img, ...p.gallery].map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="keep-color overflow-hidden rounded-2xl border border-white/12"
            >
              <img
                src={src}
                alt={`${p.name} screen ${i + 1}`}
                loading="lazy"
                className="w-full object-cover object-top"
              />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-xl md:text-2xl font-medium uppercase">More work</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {others.map((o) => (
            <Link
              key={o.slug}
              to="/portfolio/$slug"
              params={{ slug: o.slug }}
              className="group overflow-hidden rounded-2xl border border-white/12"
            >
              <div className="keep-color overflow-hidden">
                <img
                  src={o.img}
                  alt={`${o.name} preview`}
                  loading="lazy"
                  className="h-40 w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="text-[0.65rem] uppercase tracking-wider opacity-50">{o.category}</p>
                <p className="mt-1 text-sm uppercase">{o.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
