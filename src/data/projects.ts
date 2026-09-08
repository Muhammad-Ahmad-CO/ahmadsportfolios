import projWoblo from "@/assets/proj-woblo.jpg";
import projMonolith from "@/assets/proj-monolith.jpg";
import projRoyal from "@/assets/proj-royal.jpg";
import projCement from "@/assets/proj-cement.jpg";
import projHearth from "@/assets/proj-hearth.jpg";
import projBloom from "@/assets/proj-bloom.jpg";
import projAlfjr from "@/assets/proj-alfjr.jpg";

import wobloG1 from "@/assets/woblo-g1.jpg";
import wobloG2 from "@/assets/woblo-g2.jpg";
import monolithG1 from "@/assets/monolith-g1.jpg";
import monolithG2 from "@/assets/monolith-g2.jpg";
import royalG1 from "@/assets/royal-g1.jpg";
import royalG2 from "@/assets/royal-g2.jpg";
import cementG1 from "@/assets/cement-g1.jpg";
import cementG2 from "@/assets/cement-g2.jpg";
import hearthG1 from "@/assets/hearth-g1.jpg";
import hearthG2 from "@/assets/hearth-g2.jpg";
import bloomG1 from "@/assets/bloom-g1.jpg";
import bloomG2 from "@/assets/bloom-g2.jpg";
import alfjrG1 from "@/assets/alfjr-g1.jpg";
import alfjrG2 from "@/assets/alfjr-g2.jpg";

export type Project = {
  n: string;
  slug: string;
  name: string;
  category: string;
  url: string;
  img: string;
  gallery: string[];
  desc: string;
  overview: string;
  highlights: string[];
  stack: string[];
  year: string;
  role: string;
  tags: string[];
};

export const PROJECTS: Project[] = [
  {
    n: "01",
    slug: "woblo-creative-studio",
    name: "Woblo Creative Studio",
    category: "WebGL / 3D",
    url: "https://woblo.lovable.app",
    img: projWoblo,
    gallery: [wobloG1, wobloG2],
    desc: "A creative digital studio site built around motion, WebGL and 3D storytelling — immersive scroll sequences, a showreel moment and case studies that keep visitors exploring.",
    overview:
      "Woblo needed a homepage that feels like a showreel rather than a brochure. The build leans on layered scroll sequences, 3D scenes and typographic motion so every section hands off to the next without a hard cut, while the case-study grid keeps the work itself in focus.",
    highlights: [
      "Scroll-driven 3D hero with continuous motion handoff",
      "Case-study grid with hover previews",
      "Performance-tuned animation loop for mobile",
    ],
    stack: ["React", "WebGL", "Framer Motion", "Tailwind CSS"],
    year: "2026",
    role: "Design & Front-end",
    tags: ["WebGL", "3D", "Motion"],
  },
  {
    n: "02",
    slug: "monolith-studio",
    name: "Monolith Studio",
    category: "Brand Site",
    url: "https://monolithstudio.lovable.app",
    img: projMonolith,
    gallery: [monolithG1, monolithG2],
    desc: "A contemporary Brooklyn tattoo studio site: 25 resident artists with individual booking, a live local clock, editorial typography and a stark black-and-white identity.",
    overview:
      "A studio with 25 resident artists needed every artist to feel like their own brand while the studio still reads as one identity. The layout is editorial and strictly black and white, with per-artist pages, individual booking entry points and a live local clock that grounds the studio in its neighbourhood.",
    highlights: [
      "Per-artist profiles with independent booking flow",
      "Editorial black-and-white type system",
      "Live local time and studio hours",
    ],
    stack: ["React", "TypeScript", "Tailwind CSS"],
    year: "2026",
    role: "Design & Front-end",
    tags: ["Editorial", "Booking", "Dark UI"],
  },
  {
    n: "03",
    slug: "royal-beverage",
    name: "Royal Beverage",
    category: "Corporate",
    url: "https://royal-beverages.lovable.app",
    img: projRoyal,
    gallery: [royalG1, royalG2],
    desc: "Corporate site for a beverage producer running since 1994 — company story, product range, production process and news, presented with a clean, trust-building layout.",
    overview:
      "A manufacturer active since 1994 wanted its scale and reliability to come across immediately. The site pairs a calm corporate layout with a clear product range, a walkthrough of the production process and a news area, so distributors and partners can verify credibility in a single visit.",
    highlights: [
      "Structured product catalogue by beverage line",
      "Production-process walkthrough section",
      "News and company-history pages",
    ],
    stack: ["React", "TypeScript", "Tailwind CSS"],
    year: "2025",
    role: "Design & Front-end",
    tags: ["Products", "Company", "Multi-page"],
  },
  {
    n: "04",
    slug: "cura-climate",
    name: "CURA Climate",
    category: "Climate Tech",
    url: "https://cement-zen.lovable.app",
    img: projCement,
    gallery: [cementG1, cementG2],
    desc: "A climate-tech landing page for decarbonized cement technology, translating heavy industrial data into a sharp scroll narrative with clear proof points and a strong CTA.",
    overview:
      "Decarbonized cement is a hard sell in a single scroll. The page turns dense industrial figures into a paced narrative: the problem, the process, the emissions maths, then the proof points — each block sized so an investor or plant operator can skim it and still land on the same call to action.",
    highlights: [
      "Data-led scroll narrative with animated figures",
      "Emissions comparison and proof-point blocks",
      "Single conversion path for enterprise enquiries",
    ],
    stack: ["React", "Framer Motion", "Tailwind CSS"],
    year: "2026",
    role: "Design & Front-end",
    tags: ["Landing", "Data Story", "Scroll"],
  },
  {
    n: "05",
    slug: "maison-home-store",
    name: "Maison Home Store",
    category: "E-commerce",
    url: "https://home-hearth-store.lovable.app",
    img: projHearth,
    gallery: [hearthG1, hearthG2],
    desc: "A calm e-commerce experience for handcrafted home goods: featured collections, product cards with pricing and materials, and a warm, minimal shopping flow.",
    overview:
      "Handcrafted goods sell on texture and material, so the storefront gives photography room to breathe. Collections lead, product cards carry price and material up front, and the checkout path stays short enough that browsing never turns into friction.",
    highlights: [
      "Collection-first browsing with large imagery",
      "Product cards showing price and materials",
      "Short, distraction-free purchase flow",
    ],
    stack: ["React", "TypeScript", "Tailwind CSS"],
    year: "2025",
    role: "Design & Front-end",
    tags: ["Shop", "Catalog", "Minimal"],
  },
  {
    n: "06",
    slug: "verdant-studio",
    name: "Verdant Studio",
    category: "Agency",
    url: "https://cinematic-bloom-design.lovable.app",
    img: projBloom,
    gallery: [bloomG1, bloomG2],
    desc: "A cinematic agency portfolio blending nature and technology — philosophy, capabilities and process sections composed with restrained motion and generous space.",
    overview:
      "An agency positioned between nature and technology needed a site that felt cinematic without shouting. Wide margins, slow reveals and a restrained palette carry the philosophy, capabilities and process sections, letting the imagery do the persuading.",
    highlights: [
      "Cinematic section reveals with restrained motion",
      "Philosophy, capabilities and process narrative",
      "Generous spatial rhythm across breakpoints",
    ],
    stack: ["React", "Framer Motion", "Tailwind CSS"],
    year: "2026",
    role: "Design & Front-end",
    tags: ["Cinematic", "Portfolio", "Brand"],
  },
  {
    n: "07",
    slug: "al-fajr-foods",
    name: "Al Fajr Foods",
    category: "Restaurant",
    url: "https://al-fjrfoods.lovable.app",
    img: projAlfjr,
    gallery: [alfjrG1, alfjrG2],
    desc: "A restaurant site for a Latifabad favourite — full menu by category, cart and sign-in, opening hours and location, built for hungry visitors on mobile.",
    overview:
      "Most visitors arrive hungry and on a phone, so the menu is the homepage. Categories load fast, items go straight into a cart, and hours plus location sit where a first-time customer looks for them instead of behind another tap.",
    highlights: [
      "Full menu browsing by category",
      "Cart and sign-in for repeat orders",
      "Hours, location and contact above the fold on mobile",
    ],
    stack: ["React", "TypeScript", "Tailwind CSS"],
    year: "2025",
    role: "Design & Front-end",
    tags: ["Menu", "Cart", "Local SEO"],
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
