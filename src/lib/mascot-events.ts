export const MASCOT_REACTION_EVENT = "portfolio:mascot-reaction";
export type MascotReaction = "error" | "celebrate";

export function notifyMascot(reaction: MascotReaction) {
  window.dispatchEvent(new CustomEvent(MASCOT_REACTION_EVENT, { detail: reaction }));
}