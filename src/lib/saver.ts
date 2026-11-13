import { APPLIANCES, type Appliance } from "./appliances";
import type { HomeState } from "./energy";

/** Predefined rule: essential appliances (fridge, lights) are never switched off by the Energy Saver. */
export const saverCandidates = (s: HomeState): Appliance[] => APPLIANCES.filter((a) => s.on[a.id] && !a.essential);

export function applySaver(s: HomeState): HomeState {
  const on = { ...s.on };
  for (const a of saverCandidates(s)) on[a.id] = false;
  return { ...s, on };
}

export const joinNames = (l: string[]) => (l.length < 2 ? l.join("") : `${l.slice(0, -1).join(", ")} and ${l[l.length - 1]}`);
