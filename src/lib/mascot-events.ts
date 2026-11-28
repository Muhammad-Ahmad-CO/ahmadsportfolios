export const MASCOT_REACTION_EVENT = "portfolio:mascot-reaction";
export type MascotReaction = "error" | "celebrate";

export function notifyMascot(reaction: MascotReaction) {
  window.dispatchEvent(new CustomEvent(MASCOT_REACTION_EVENT, { detail: reaction }));
}

/** Fired when the Launch gate opens the site, so the mascot can start its greeting bubbles. */
export const SITE_ENTERED_EVENT = "portfolio:site-entered";

export function notifySiteEntered() {
  window.dispatchEvent(new CustomEvent(SITE_ENTERED_EVENT));
}