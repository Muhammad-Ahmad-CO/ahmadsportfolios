# Architecture rules
- Keep the shared mascot mounted in the root layout behind ClientOnly and a lazy import, so its browser animation code never executes during SSR and survives page navigation.
- Use a small browser event bridge for contact-form mascot reactions, keeping email delivery and validation logic independent of the avatar library.
- Preserve the exported mascot JSON unchanged; configure one-shot reactions in the renderer using the library's supported playback mode.
- Keep the rolling counter as an independent client-animated clock companion with flat projected drum faces; this avoids CSS 3D rendering inconsistencies and preserves page layout.