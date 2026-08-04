import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView } from "framer-motion";

import { ArrowUpRight, Mail, Phone, Linkedin, Github, Home } from "lucide-react";
import portrait from "@/assets/portrait.png";
import { CrowdCanvas } from "@/components/CrowdCanvas";
import { BlastPortrait } from "@/components/ui/blast-portrait";
import FlipClock from "@/components/ui/flip-clock";

import GlassCard from "@/components/ui/glass-card";
import SocialCard from "@/components/ui/social-card";
import Preloader from "@/components/ui/preloader";
import { GlyphMatrix } from "@/components/ui/glyph-matrix";
import { IntegrationTicker } from "@/components/ui/integration-ticker";
import { Dock, DockIcon } from "@/components/ui/dock";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { TextEffect } from "@/components/ui/text-effect";


export const Route = createFileRoute("/")({
  component: Index,
});

const EMAIL = "ahmadkaimkhani40@gmail.com";
const EMAIL_URL = "https://mail.google.com/mail/u/0/#inbox?compose=CllgCJZdkVhRGrbbFWcdWbLMdzclsLZWWCrlpQXSgjxXVWPRCcKSkfmPCpvntnfVlfDCCfbrPlB";
const PHONE = "0314-1241710";
const LINKEDIN = "https://www.linkedin.com/in/muhammad-ahmed";
const GITHUB = "https://github.com/kaim953";

/* ---------------- Reusable ---------------- */
function FadeIn({
  children,
  delay = 0,
  y = 30,
  x = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ContactButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={EMAIL_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Send an email to Muhammad Ahmed via Gmail"
      role="button"
      className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 md:px-7 md:py-3 text-sm md:text-base uppercase tracking-wider text-[#0C0C0C] font-medium transition-transform hover:scale-105 ${className}`}
      style={{ background: "linear-gradient(180deg, #BBCCD7 0%, #D7E2EA 100%)" }}
    >
      Contact Me
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
    </a>
  );
}

function LiveProjectButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm uppercase tracking-wider text-[#D7E2EA] transition-colors hover:bg-[#D7E2EA] hover:text-[#0C0C0C]"
    >
      Live Project
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
    </a>
  );
}

function Magnet({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15 });
  const sy = useSpring(y, { stiffness: 150, damping: 15 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - (rect.left + rect.width / 2);
    const my = e.clientY - (rect.top + rect.height / 2);
    x.set(mx * strength);
    y.set(my * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });
  const chars = text.split("");
  return (
    <p
      ref={ref}
      className="text-center font-medium leading-relaxed mx-auto max-w-[640px] flex flex-wrap justify-center"
      style={{
        color: "#D7E2EA",
        fontSize: "clamp(1rem, 2vw, 1.35rem)",
      }}
    >
      {chars.map((c, i) => {
        const start = i / chars.length;
        const end = start + 1 / chars.length;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);
        return (
          <motion.span key={i} style={{ opacity }}>
            {c === " " ? "\u00A0" : c}
          </motion.span>
        );
      })}
    </p>
  );
}

/* ---------------- TextRoll ---------------- */
const STAGGER = 0.035;
function TextRoll({ children, center = true }: { children: string; center?: boolean }) {
  const letters = children.split("");
  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className="relative block overflow-hidden whitespace-nowrap"
      style={{ lineHeight: 1 }}
    >
      <span className="block">
        {letters.map((l, i) => {
          const delay = center ? STAGGER * Math.abs(i - (letters.length - 1) / 2) : STAGGER * i;
          return (
            <motion.span
              key={i}
              variants={{ initial: { y: 0 }, hovered: { y: "-100%" } }}
              transition={{ duration: 0.35, ease: "easeInOut", delay }}
              className="inline-block"
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          );
        })}
      </span>
      <span className="absolute inset-0 block">
        {letters.map((l, i) => {
          const delay = center ? STAGGER * Math.abs(i - (letters.length - 1) / 2) : STAGGER * i;
          return (
            <motion.span
              key={i}
              variants={{ initial: { y: "100%" }, hovered: { y: 0 } }}
              transition={{ duration: 0.35, ease: "easeInOut", delay }}
              className="inline-block"
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          );
        })}
      </span>
    </motion.span>
  );
}

/* ---------------- Sections ---------------- */
function Hero() {
  return (
    <section
      id="hero"
      className="relative flex h-screen min-h-[700px] flex-col"
      style={{ overflowX: "clip" }}
    >
      {/* Navbar */}
      <FadeIn y={-20} delay={0}>
        <nav className="flex items-center justify-end gap-3 px-4 sm:px-6 md:px-10 pt-6 md:pt-8">
          <ul className="flex min-w-0 flex-wrap justify-end gap-x-3 gap-y-1 sm:gap-5 md:gap-10 text-[0.7rem] sm:text-sm lg:text-[1.1rem] uppercase tracking-wider text-[#D7E2EA]">
            {[
              { l: "About", h: "#about" },
              { l: "Price", h: "#services" },
              { l: "Projects", h: "#projects" },
              { l: "Contact", h: "#footer" },
            ].map((n) => (
              <li key={n.l}>
                <a href={n.h} className="inline-block transition-opacity hover:opacity-90">
                  <TextRoll>{n.l}</TextRoll>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </FadeIn>

      {/* Heading */}
      <div className="mt-20 sm:mt-8 md:-mt-5 px-4">
        <FadeIn y={40} delay={0.15}>
          <h1
            className="hero-heading font-black uppercase tracking-tight leading-[0.95] text-center break-words"
            style={{ fontSize: "clamp(2rem, 11vw, 17.5vw)" }}
          >
            Hi, I&rsquo;m Muhammad Ahmed
          </h1>
        </FadeIn>
      </div>

      {/* Bottom bar */}
      <div className="relative z-20 mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 px-4 sm:px-6 md:px-10 pb-24 sm:pb-12 md:pb-12">
        <FadeIn y={20} delay={0.35} className="min-w-0 max-w-[150px] sm:max-w-[260px]">
          <p
            className="font-light uppercase tracking-wide"
            style={{
              color: "#D7E2EA",
              fontSize: "clamp(0.65rem, 1.4vw, 1.5rem)",
            }}
          >
            Driving the Future with AI &amp; Code
          </p>
        </FadeIn>
        <FadeIn y={20} delay={0.5} className="relative flex flex-col items-end gap-1">
          <ContactButton />
        </FadeIn>
      </div>


      {/* Portrait (passport-style avatar frame) */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-x-0 bottom-32 sm:bottom-16 md:bottom-16 z-10 flex items-end justify-center"
      >
        <Magnet strength={0.1}>
          <div
            className="keep-color pointer-events-auto relative mx-auto"
            style={{
              filter:
                "drop-shadow(0 30px 40px rgba(0,0,0,0.55)) drop-shadow(0 0 70px rgba(187,204,215,0.18))",
            }}
          >
            {/* Soft radial glow behind subject */}
            <div
              aria-hidden
              className="absolute -inset-6 -z-10"
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 50%, rgba(187,204,215,0.28) 0%, rgba(187,204,215,0.08) 45%, transparent 75%)",
                filter: "blur(8px)",
              }}
            />
            <PortraitAvatar />
          </div>
        </Magnet>
      </motion.div>
    </section>
  );
}

function PortraitAvatar() {
  const [blasted, setBlasted] = useState(false);

  return (
    <div
      className="group relative rounded-[28px] h-[210px] w-[170px] sm:h-[300px] sm:w-[245px] md:h-[380px] md:w-[310px] lg:h-[440px] lg:w-[360px] transition-[background,border-color,box-shadow] duration-500 ease-out"
      onMouseEnter={() => setBlasted(true)}
      onMouseLeave={() => setBlasted(false)}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") setBlasted((v) => !v);
      }}
      style={{
        touchAction: "manipulation",
        border: `1px solid ${blasted ? "transparent" : "rgba(215,226,234,0.22)"}`,
        padding: "10px",
        background: blasted
          ? "transparent"
          : "linear-gradient(160deg, rgba(215,226,234,0.10) 0%, rgba(187,204,215,0.04) 60%, rgba(12,12,12,0.35) 100%)",
        boxShadow: blasted
          ? "none"
          : "inset 0 1px 0 rgba(255,255,255,0.08), 0 30px 60px -20px rgba(0,0,0,0.6)",
      }}
    >
      <BlastPortrait
        src={portrait}
        alt="Muhammad Ahmed portrait"
        rows={9}
        cols={7}
        radius="20px"
        blasted={blasted}
        className="h-full w-full grayscale transition-[filter] duration-700 ease-out group-hover:grayscale-0"
      />
      <GlyphMatrix
        color="#D7E2EA"
        cellSize={12}
        mutationRate={0.05}
        interval={100}
        fadeBottom={0.5}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-[10px] rounded-[20px] mix-blend-screen transition-opacity duration-500 ease-out ${
          blasted ? "opacity-0" : "opacity-40"
        }`}
      />
    </div>
  );
}



function Marquee() {
  return (
    <section className="py-16 md:py-24">
      <IntegrationTicker />
    </section>
  );
}


const BIO =
  "Hello! I am Muhammad Ahmed, a Software Engineering student at Sindh Agriculture University, Tandojam, and a passionate AI Specialist. My work isn't just about writing code; it's about leveraging the power of AI to create intelligent and efficient solutions. I specialize in automating and optimizing coding workflows through modern AI tools and frameworks. My goal is to implement technology in a way that provides smarter, more effective solutions to real-world problems. I don't just write code; I orchestrate AI. I use LLMs to scaffold complex architectures, perform deep-dive debugging, and optimize algorithms, ensuring that the final product is not only functional but also follows industry-standard clean code practices.";

function About() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [replay, setReplay] = useState(true);
  const inView = useInView(targetRef, { once: !replay, amount: 0.15 });

  return (
    <section
      id="about"
      ref={targetRef}
      className="relative w-full px-5 py-24 sm:px-8 sm:py-28 md:px-10 md:py-36"
    >
      <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center">
        <FadeIn>
          <h2
            className="hero-heading text-center font-black uppercase tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 10vw, 130px)" }}
          >
            About me
          </h2>
        </FadeIn>

        <button
          type="button"
          onClick={() => setReplay((v) => !v)}
          aria-pressed={replay}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#D7E2EA]/30 px-4 py-1.5 text-[0.7rem] uppercase tracking-wider text-[#D7E2EA]/70 transition-colors hover:border-[#D7E2EA]/60 hover:text-[#D7E2EA]"
        >
          <span
            className={`h-2 w-2 rounded-full transition-colors ${
              replay ? "bg-[#BBCCD7]" : "bg-[#D7E2EA]/25"
            }`}
          />
          Replay on scroll {replay ? "On" : "Off"}
        </button>

        <div className="mt-8 w-full md:mt-12">
          <TextEffect
            key={replay ? "replay" : "once"}
            per="word"
            preset="blur"
            trigger={inView}
            delay={0.2}
            as="p"
            className="mx-auto max-w-[900px] text-center font-medium leading-[1.55] text-[#D7E2EA] text-[clamp(1.15rem,2.6vw,2rem)]"
          >
            {BIO}
          </TextEffect>
        </div>
      </div>
    </section>
  );
}


const SERVICES = [
  { n: "01", name: "AI Integration & APIs", d: "Seamlessly embedding intelligent models and third-party AI services into existing systems or websites." },
  { n: "02", name: "Computer Vision Solutions", d: "Real-time hand tracking, object detection, and MediaPipe-powered interactive experiences." },
  { n: "03", name: "Intelligent Automation", d: "Automating repetitive coding tasks, data pipelines, and workflow optimisation using LLMs and scripting." },
  { n: "04", name: "AI-Powered Web Applications", d: "Building responsive, modern web apps that leverage AI on the frontend and backend." },
  { n: "05", name: "Technical Consulting", d: "Advising on AI strategy, tool selection, and clean code practices for teams and startups." },
];

function Services() {
  return (
    <section
      id="services"
      className="bg-white rounded-t-[40px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 md:py-28"
    >
      <FadeIn>
        <h2
          className="font-black uppercase tracking-tight text-[#0C0C0C] mb-16 sm:mb-20 md:mb-28"
          style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
        >
          Services
        </h2>
      </FadeIn>
      <div>
        {SERVICES.map((s, i) => (
          <FadeIn key={s.n} delay={i * 0.08}>
            <div
              className="flex flex-col md:flex-row md:items-center gap-3 md:gap-10 py-8 md:py-10"
              style={{ borderTop: "1px solid rgba(12,12,12,0.15)" }}
            >
              <span
                className="font-light text-[#0C0C0C]/80"
                style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)" }}
              >
                {s.n}
              </span>
              <h3
                className="uppercase font-medium text-[#0C0C0C] md:w-1/3"
                style={{ fontSize: "clamp(1.25rem, 2.5vw, 2rem)" }}
              >
                {s.name}
              </h3>
              <p className="text-[#0C0C0C]/60 md:flex-1 md:text-right text-base md:text-lg max-w-2xl md:ml-auto">
                {s.d}
              </p>
            </div>
          </FadeIn>
        ))}
        <div style={{ borderTop: "1px solid rgba(12,12,12,0.15)" }} />
      </div>
    </section>
  );
}

const PROJECTS = [
  { n: "01", name: "Car Customization", category: "Personal", url: "https://019dcdd0-0d09-78ea-9fbe-3a1083806ed1.arena.site/", g1: "from-red-500 to-orange-600", g2: "from-zinc-700 to-zinc-900", g3: "from-orange-400 via-red-500 to-rose-700" },
  { n: "02", name: "Skin Care Routine", category: "Personal", url: "https://019dcd3f-e3e6-77e7-bf0e-82469eff1a73.arena.site/", g1: "from-pink-300 to-rose-400", g2: "from-amber-200 to-pink-300", g3: "from-rose-300 via-pink-400 to-fuchsia-500" },
  { n: "03", name: "Neural Hands Tracking", category: "Personal", url: "https://019dca8c-d485-73cb-a8fe-a9f6eeef26c0.arena.site/", g1: "from-cyan-400 to-blue-600", g2: "from-indigo-500 to-purple-700", g3: "from-sky-400 via-cyan-500 to-blue-700" },
  { n: "04", name: "Study Mentor", category: "Personal", url: "https://019dc13a-492a-7dc7-afeb-8b6c41175485.arena.site/", g1: "from-emerald-400 to-teal-600", g2: "from-lime-400 to-emerald-600", g3: "from-teal-400 via-emerald-500 to-green-700" },
  { n: "05", name: "Sample Portfolio Design", category: "Personal", url: "https://019da0da-59ed-754a-8ca6-05f228d4c1d4.arena.site/", g1: "from-slate-400 to-slate-700", g2: "from-zinc-300 to-slate-500", g3: "from-slate-500 via-zinc-600 to-slate-900" },
];

function ProjectCard({
  p,
  index,
  total,
}: {
  p: (typeof PROJECTS)[number];
  index: number;
  total: number;
}) {
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div ref={ref} className="h-[85vh] flex items-start justify-center sticky" style={{ top: `${index * 28}px` }}>
      <motion.article
        style={{ scale }}
        className="w-full rounded-[32px] md:rounded-[56px] border-2 border-[#D7E2EA] p-4 sm:p-6 md:p-8 bg-[#0C0C0C]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-5 text-[#D7E2EA]">
            <span className="font-light text-2xl md:text-4xl">{p.n}</span>
            <span className="uppercase tracking-wider text-xs md:text-sm opacity-60">
              {p.category}
            </span>
            <h3 className="uppercase font-medium text-xl md:text-3xl">{p.name}</h3>
          </div>
          <LiveProjectButton href={p.url} />
        </div>
        <div className="mt-5 md:mt-8 grid grid-cols-5 gap-3 md:gap-4 h-[45vh] md:h-[55vh]">
          <div className="col-span-2 flex flex-col gap-3 md:gap-4">
            <div className={`keep-color flex-1 rounded-2xl md:rounded-3xl bg-gradient-to-br ${p.g1}`} />
            <div className={`keep-color flex-1 rounded-2xl md:rounded-3xl bg-gradient-to-br ${p.g2}`} />
          </div>
          <div className={`keep-color col-span-3 rounded-2xl md:rounded-3xl bg-gradient-to-br ${p.g3}`} />
        </div>
      </motion.article>
    </div>
  );
}

function Projects() {
  return (
    <section
      id="projects"
      className="relative z-10 bg-[#0C0C0C] -mt-10 md:-mt-14 rounded-t-[40px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 pt-20 md:pt-28 pb-32"
    >
      <FadeIn>
        <h2
          className="hero-heading font-black uppercase tracking-tight mb-16 md:mb-24"
          style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
        >
          Project
        </h2>
      </FadeIn>
      <div className="relative">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.n} p={p} index={i} total={PROJECTS.length} />
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden bg-[#0C0C0C] pt-16 md:pt-24 pb-32 md:pb-32 px-6 border-t border-white/10">
      <DottedSurface className="opacity-40" />
      <div className="relative z-10 max-w-5xl mx-auto grid gap-12 md:grid-cols-2 items-center text-[#D7E2EA]">
        <div className="text-center md:text-left space-y-4">
          <h2 className="hero-heading font-black uppercase text-3xl md:text-5xl">
            Let&rsquo;s build with AI
          </h2>
          <p className="text-sm md:text-base text-[#D7E2EA]/60 max-w-md mx-auto md:mx-0">
            Reach out for collaborations, projects, or just to say hi.
          </p>
          <p className="text-xs text-[#D7E2EA]/40 pt-4">
            © 2026 Muhammad Ahmed. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col items-center gap-8 md:items-end">
          <GlassCard
            email={EMAIL}
            phone={PHONE}
            linkedin={LINKEDIN}
            github={GITHUB}
          />
          <SocialCard
            email={EMAIL}
            emailUrl={EMAIL_URL}
            phone={PHONE}
            linkedin={LINKEDIN}
            github={GITHUB}
          />
        </div>
      </div>
    </footer>
  );
}


function Index() {
  const [showClock, setShowClock] = useState(true);
  useEffect(() => {
    const onScroll = () => setShowClock(window.scrollY < window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <main className="relative bg-[#0C0C0C]">
      <Preloader duration={1800} fadeDuration={700} routeDebounce={150} />
      <div
        className={`fixed top-16 left-4 sm:top-4 sm:left-5 md:top-5 md:left-6 z-50 scale-90 sm:scale-100 transition-opacity duration-300 ${
          showClock ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <FlipClock />
      </div>
      
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30">
        <CrowdCanvas />
      </div>
      <div className="relative z-10">
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Projects />
        <Footer />
      </div>
      <div className="fixed bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-3 max-w-[calc(100vw-1.5rem)]">
        <Dock>
          <DockIcon href="#top" label="Home">
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
          </DockIcon>
          <DockIcon href={GITHUB} label="GitHub">
            <Github className="h-4 w-4 sm:h-5 sm:w-5" />
          </DockIcon>
          <DockIcon href={EMAIL_URL} label="Email">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
          </DockIcon>
        </Dock>
      </div>
    </main>
  );
}
