import type { ApplianceId } from "./appliances";
import type { HomeState } from "./energy";
import { confirmPowerCut, endPowerCut, initialState, replaceActive, requestToggle } from "./powerCut";
import { applySaver } from "./saver";

export type Action =
  | { type: "toggle"; id: ApplianceId }
  | { type: "confirmPowerCut"; ids: ApplianceId[] }
  | { type: "replace"; out: ApplianceId; incoming: ApplianceId }
  | { type: "endPowerCut" }
  | { type: "saver" }
  | { type: "setTarget"; value: number }
  | { type: "reset" };

/** Single source of truth: every interface dispatches these actions; invalid ones are ignored here as well. */
export function reducer(s: HomeState, a: Action): HomeState {
  switch (a.type) {
    case "toggle": {
      const r = requestToggle(s, a.id);
      return r.kind === "applied" ? r.next : s;
    }
    case "confirmPowerCut": {
      const r = confirmPowerCut(s, a.ids);
      return r.ok ? r.next : s;
    }
    case "replace": {
      const r = replaceActive(s, a.out, a.incoming);
      return r.ok ? r.next : s;
    }
    case "endPowerCut":
      return endPowerCut(s);
    case "saver":
      return s.powerCut ? s : applySaver(s);
    case "setTarget":
      return a.value > 0 && Number.isFinite(a.value) ? { ...s, target: a.value } : s;
    case "reset":
      return initialState();
  }
}
