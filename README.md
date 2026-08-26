# AI Orchestrator

Product Requirements Document (PRD)
Project Name:
AI Specialist Portfolio — Muhammad Ahmed

Version:
1.0

Date:
21 May 2026

Author:
Muhammad Ahmed

1. Executive Summary
This document defines the requirements for a single‑page portfolio website for Muhammad Ahmed, an AI Specialist currently pursuing a Software Engineering degree. The website presents his AI‑focused skills, projects, and contact information through a high‑impact, scroll‑driven design.
The entire experience is built with React, TypeScript, Tailwind CSS, Framer Motion, and Lucide React. The visual identity is a dark, tech‑forward aesthetic, heavily animated, fully responsive, and designed to be shared with recruiters and organisations.

2. Project Goals
Communicate Muhammad Ahmed’s expertise as an AI Specialist who orchestrates intelligent, efficient solutions.

Showcase real project work (live URLs) in a stunning interactive format.

Provide easy access to contact details (email, phone, LinkedIn, GitHub).

Deliver a memorable, portfolio‑driven first impression that stands out in any job application.

3. Target Audience
Tech recruiters and hiring managers looking for AI talent.

Engineering managers seeking AI integration or automation help.

Freelance clients interested in AI‑powered web solutions.

4. User Stories
As a recruiter, I want to understand instantly what Muhammad does and see real projects.

As a potential client, I want to quickly view services and live demos, then contact him.

As a mobile visitor, I expect fluid performance and readable typography on any device.

5. Functional Requirements
5.1 Page Structure (Single Page)
The page is divided into five major sections, exactly in this order:

Hero Section

Marquee Section (animated GIF showcase)

About Section (personal story + skills embedded)

Services Section (AI‑oriented offerings)

Projects Section (five real projects with live links)

Footer (contact details)

5.2 Navigation
Top‑bar navigation inside the Hero Section with smooth‑scroll anchors: About, Price (→ Services), Projects, Contact (→ Hero bottom/footer).

Clicking a link smoothly scrolls to the corresponding section.

5.3 Contact & Social Links
Primary CTA: “Contact Me” button in Hero and after About section → opens mailto:ahmadkaimkhani40@gmail.com.

Footer (or bottom of page) will display:

Email: ahmadkaimkhani40@gmail.com

Phone: 0314-1241710

LinkedIn: Muhammad Ahmed

GitHub: kaim953

“Live Project” buttons on each project card open the respective Arena.site URL.

6. Technical Requirements
Layer	Technology
Framework	React 18.3.1 + TypeScript
Build Tool	Vite
Styling	Tailwind CSS 3.4.1
Animation	Framer Motion 12.38.0
Icons	Lucide React 0.344.0
Font	Kanit (Google Fonts, weights 300‑900)
Deployment	Static site hosting (e.g., Vercel / Netlify)
6.1 Global Styles
Background: #0C0C0C on html, body, #root, main wrapper.

Font: 'Kanit', sans-serif; global reset: box-sizing: border-box, margin/padding: 0.

Gradient text class .hero-heading: linear-gradient(180deg, #646973 0%, #BBCCD7 100%) with -webkit-background-clip: text and -webkit-text-fill-color: transparent.

Main wrapper: overflow-x: clip.

6.2 Responsive Design
Mobile‑first; Tailwind breakpoints: sm (640px), md (768px), lg (1024px).

Fluid typography via CSS clamp() everywhere.

All sections scale gracefully from 320px to ultra‑wide.

6.3 Performance
Lazy‑loaded images (GIFs, project screenshots).

Marquee: will-change: transform, passive scroll listener.

Framer Motion: whileInView with once: true.

7. Detailed Section Specifications
7.1 Hero Section
Layout: Full screen (h-screen), flex column, overflow-x: clip.

Navbar:
Links: “About”, “Price”, “Projects”, “Contact”.
Uppercase, tracking-wider, #D7E2EA, hover opacity 70%.
Responsive sizes: text-sm → lg:text-[1.4rem].
Padding: px-6 md:px-10 pt-6 md:pt-8.

Hero Heading: Massive h1 with “Hi, I’m Muhammad Ahmed” (capital I, apostrophe in I’m).
Uses .hero-heading gradient, font-black, uppercase, tracking-tight, leading-none, whitespace-nowrap.
Size: text-[14vw] → lg:text-[17.5vw].
Margins: mt-6 sm:mt-4 md:-mt-5. Wrapped in overflow-hidden.

Bottom Bar: Flex justify-between items-end.

Left: Tagline “Driving the Future with AI & Code” in #D7E2EA, font-light, uppercase, tracking-wide, fluid size (clamp(0.75rem, 1.4vw, 1.5rem)), max-w-[260px].

Right: ContactButton (see components).

Portrait Image: Centred absolutely, wrapped in a Magnet (mouse‑follow) component.
Image: placeholder – to be replaced with Muhammad Ahmed’s photo.
Widths: 280px → lg:520px. Mobile: vertically centred; sm+: bottom‑aligned.

Staggered Fade‑in Animations:
Navbar (delay 0, y -20), Heading (delay 0.15, y 40), Tagline (delay 0.35, y 20), Contact button (delay 0.5, y 20), Portrait (delay 0.6, y 30).

7.2 Marquee Section
Two rows of 21 GIFs from motionsites.ai (same URLs as original template) that scroll horizontally with page scroll.

Row 1: first 11 images, tripled, moves right (translateX(offset - 200)).

Row 2: remaining 10 images, tripled, moves left (translateX(-(offset - 200))).

Each tile: 420px x 270px, rounded-2xl, object-cover, lazy. gap-3.

Offset: (window.scrollY - sectionTop + window.innerHeight) * 0.3.

Uses will-change: transform, passive scroll listener.

7.3 About Section
min-h-screen, padding px-5 sm:px-8 md:px-10 py-20.

Decorative Corner Images (can later be swapped for AI‑themed icons – currently kept as abstract 3D shapes):

Top‑left, bottom‑left, top‑right, bottom‑right PNGs with staggered FadeIn from left/right.

Heading: “About me” in .hero-heading gradient, font-black, size clamp(3rem, 12vw, 160px).

Animated Paragraph (Character‑by‑character scroll‑reveal):
The exact bio text from Muhammad Ahmed:

“Hello! I am Muhammad Ahmed, a Software Engineering student at Sindh Agriculture University, Tandojam, and a passionate AI Specialist.
My work isn’t just about writing code; it’s about leveraging the power of AI to create intelligent and efficient solutions. I specialize in automating and optimizing coding workflows through modern AI tools and frameworks. My goal is to implement technology in a way that provides smarter, more effective solutions to real‑world problems.
I don’t just write code; I orchestrate AI. I use LLMs to scaffold complex architectures, perform deep‑dive debugging, and optimize algorithms, ensuring that the final product is not only functional but also follows industry‑standard clean code practices.”

Text colour #D7E2EA, font-medium, centred, max-w-[560px], leading-relaxed, size clamp(1rem, 2vw, 1.35rem).
Each character fades from opacity 0.2 to 1 via useScroll with offset ['start 0.8', 'end 0.2'].

Skills embedded naturally in the paragraph (no separate list; skills are described in the narrative).

ContactButton placed below the paragraph.

7.4 Services Section
Background: White (#FFFFFF), top corners rounded (rounded-t-[40px] → md:rounded-t-[60px]).

Heading: “Services” in #0C0C0C, font-black, size clamp(3rem, 12vw, 160px). Margin‑bottom: mb-16 sm:mb-20 md:mb-28.

5 AI‑focused service items (tuned to Muhammad Ahmed’s expertise):

01 – AI Integration & APIs – Seamlessly embedding intelligent models and third‑party AI services into existing systems or websites.
02 – Computer Vision Solutions – Real‑time hand tracking, object detection, and media‑pipe powered interactive experiences.
03 – Intelligent Automation – Automating repetitive coding tasks, data pipelines, and workflow optimisation using LLMs and scripting.
04 – AI‑Powered Web Applications – Building responsive, modern web apps that leverage AI on the frontend and backend.
05 – Technical Consulting – Advising on AI strategy, tool selection, and clean code practices for teams and startups.
Each item: large number (same style as original), service name (uppercase, font-medium), and description (opacity 0.6). Separated by 1px border rgba(12,12,12,0.15). Staggered FadeIn.

7.5 Projects Section
Background: #0C0C0C, top rounded corners, pulled up (-mt-10 → md:-mt-14), z-10.

Heading: “Project” in gradient.

Sticky Stacking Cards:
Now 5 cards (instead of 3) to accommodate all projects. The same stacking formula applies:

targetScale = 1 - (totalCards - 1 - index) * 0.03

Offset: top: ${index * 28}px

Each card container: h-[85vh], card is sticky top-24 md:top-32.

Project Card Layout: rounded-[40px]–60px, border 2px solid #D7E2EA, p-4 sm:p-6 md:p-8.

Top row: number, category (“Personal”), project name, and LiveProjectButton (link to live URL).

Bottom row: two‑column image grid (left 40% two stacked images, right 60% one tall image). Images heavily rounded.

Project Data (all personal projects):

01 – Car Customization
Live URL: https://019dcdd0-0d09-78ea-9fbe-3a1083806ed1.arena.site/
Images: [screenshot_1_car_top.png], [screenshot_1_car_bottom.png], [screenshot_1_car_main.png] (to be captured)
02 – Skin Care Routine
Live URL: https://019dcd3f-e3e6-77e7-bf0e-82469eff1a73.arena.site/
Images: [...]
03 – Neural Hands Tracking (MediaPipe)
Live URL: https://019dca8c-d485-73cb-a8fe-a9f6eeef26c0.arena.site/
Images: [...]
04 – Study Mentor (Subject‑Specific)
Live URL: https://019dc13a-492a-7dc7-afeb-8b6c41175485.arena.site/
Images: [...]
05 – Sample Portfolio Design
Live URL: https://019da0da-59ed-754a-8ca6-05f228d4c1d4.arena.site/
Images: [...]
Note: Project screenshots must be taken manually, optimised, and uploaded to a CDN. Placeholder CloudFront URLs from the original template are removed.

8. Footer (New Section)
Dark background #0C0C0C, padding py-10.

Centred contact info in #D7E2EA, text-sm to text-base:

Email: ahmadkaimkhani40@gmail.com

Phone: 0314-1241710

LinkedIn: clickable link

GitHub: clickable link

Small copyright: “© 2026 Muhammad Ahmed. All rights reserved.”

9. Reusable Components
Same set as original, with minor label changes:

ContactButton: Label “Contact Me”, gradient pill, links to mailto:ahmadkaimkhani40@gmail.com.

LiveProjectButton: Label “Live Project”, outline pill, opens project URL in new tab.

FadeIn: Configurable delay, x/y, triggers on view.

Magnet: Mouse‑follow on portrait.

AnimatedText: Character‑by‑character reveal.

10. Personalisation Checklist
✅ Name: Muhammad Ahmed

✅ Page title: “Muhammad Ahmed – AI Specialist”

✅ Hero greeting: “Hi, I’m Muhammad Ahmed”

✅ Tagline: “Driving the Future with AI & Code”

✅ About text: custom bio with skills narrative

✅ Education: Sindh Agriculture University, Tandojam – Software Engineering (bachelor’s)

✅ Projects: 5 Arena.site URLs; Live Project buttons point to each

✅ Services rewritten to AI‑centric offerings

✅ Contact: email, phone, LinkedIn, GitHub in footer

✅ Portrait placeholder to be filled with real photo

✅ Project screenshots to be captured and uploaded

11. Milestones
Phase	Effort
Setup & global styles	1 day
Hero Section	2 days
Marquee Section	2 days
About Section	3 days
Services Section (AI)	1.5 days
Projects Section (5 cards)	3 days
Footer & contact links	0.5 days
Content gathering (screenshots, photo)	1 day
QA / Responsive testing	2 days
Deployment	1 day
12. Risks & Notes
All placeholder images (portrait, project screenshots) must be provided before final build.

The 5‑card sticky stack may require minor tuning of spacing; the current offset of 28px per card should still work seamlessly.

If a shorter 3‑card version is preferred, simply omit the last two projects and adjust totalCards – the stacking formula is dynamic.

Email contact button can later be replaced by a simple contact form if needed.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ahmadsportfolios.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ea82f2d8-e5e0-476c-8ff6-9ce6b39b380e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
