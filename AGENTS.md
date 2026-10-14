# Architecture rules
- Keep About decode animation in a browser-safe text component with stable real-text glyphs and aria-hidden visual overlays, triggered once by the section observer; this preserves selection, wrapping, and accessibility.
- Keep the shared mascot mounted in the root layout behind ClientOnly and a lazy import, so its browser animation code never executes during SSR and survives page navigation.
- Use a small browser event bridge for contact-form mascot reactions, keeping email delivery and validation logic independent of the avatar library.
- Preserve the exported mascot JSON unchanged; configure one-shot reactions in the renderer using the library's supported playback mode.
- Keep the About logo cloud self-contained in the former photo footprint, with image-error fallbacks and reduced-motion support, so other portfolio sections remain unchanged.
- Keep the contribution calendar in a self-contained component with seeded procedural data and CSS-only twinkles; stable generation avoids hydration differences and keeps sample data separate from verified counts.
- Keep the decorative star in a lazy client-only homepage sibling with an effect-owned vanilla Three.js renderer, scoped canvas styles, resource cleanup and header-footprint clipping; this isolates browser work and preserves existing layout and navigation stacking without new dependencies.