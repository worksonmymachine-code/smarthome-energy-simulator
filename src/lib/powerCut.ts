import { APPLIANCES, DEFAULT_TARGET, DEFAULT_TARIFF, byId, type ApplianceId } from "./appliances";
import type { HomeState } from "./energy";

export const POWER_CUT_LIMIT = 3;

export const initialState = (): HomeState => ({
  on: Object.fromEntries(APPLIANCES.map((a) => [a.id, true])) as Record<ApplianceId, boolean>,
  target: DEFAULT_TARGET,
  rate: DEFAULT_TARIFF,
  powerCut: false,
});

export const activeIds = (s: HomeState): ApplianceId[] => APPLIANCES.filter((a) => s.on[a.id]).map((a) => a.id);

export type ToggleOutcome =
  | { kind: "applied"; next: HomeState; message: string }
  | { kind: "blocked"; message: string }
  | { kind: "swap"; incoming: ApplianceId };

/**
 * Single entry point for a user flipping one appliance switch (used by both interfaces).
 * During a simulated outage exactly three appliances must stay ON, so a lone switch-OFF is
 * refused and a switch-ON becomes a "swap" that the user must complete by choosing what it replaces.
 */
export function requestToggle(s: HomeState, id: ApplianceId): ToggleOutcome {
  const name = byId(id).name;
  if (s.powerCut) {
    if (s.on[id]) {
      return { kind: "blocked", message: `Power Cut is active: exactly ${POWER_CUT_LIMIT} appliances must stay ON. To change, turn another appliance ON and choose which one it replaces.` };
    }
    return { kind: "swap", incoming: id };
  }
  const now = !s.on[id];
  return { kind: "applied", next: { ...s, on: { ...s.on, [id]: now } }, message: `${name} switched ${now ? "ON" : "OFF"}` };
}

export type PowerCutResult = { ok: true; next: HomeState } | { ok: false; error: string };

const validSelection = (ids: ApplianceId[]) =>
  ids.length === POWER_CUT_LIMIT && new Set(ids).size === POWER_CUT_LIMIT && ids.every((id) => APPLIANCES.some((a) => a.id === id));

/** Confirm a manual selection: exactly three ON, everything else OFF. Never auto-selects. */
export function confirmPowerCut(s: HomeState, ids: ApplianceId[]): PowerCutResult {
  if (!validSelection(ids)) return { ok: false, error: `Select exactly ${POWER_CUT_LIMIT} appliances.` };
  const on = Object.fromEntries(APPLIANCES.map((a) => [a.id, ids.includes(a.id)])) as Record<ApplianceId, boolean>;
  return { ok: true, next: { ...s, on, powerCut: true } };
}

/** Replace one active appliance with another while the outage is active (keeps exactly three ON). */
export function replaceActive(s: HomeState, out: ApplianceId, incoming: ApplianceId): PowerCutResult {
  if (!s.powerCut || !s.on[out] || s.on[incoming] || out === incoming) return { ok: false, error: "That swap is not possible." };
  return { ok: true, next: { ...s, on: { ...s.on, [out]: false, [incoming]: true } } };
}

/** End the outage: restriction removed, appliance states preserved. */
export const endPowerCut = (s: HomeState): HomeState => ({ ...s, powerCut: false });
