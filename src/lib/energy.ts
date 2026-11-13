import { APPLIANCES, DAYS_PER_MONTH, type Appliance, type ApplianceId } from "./appliances";

export interface HomeState {
  on: Record<ApplianceId, boolean>;
  target: number;
  rate: number;
  powerCut: boolean;
}

export interface RankedAppliance {
  appliance: Appliance;
  monthlyKwh: number;
  monthlyCost: number;
  share: number; // percent of total monthly energy
}

export interface Summary {
  activeIds: ApplianceId[];
  power: number; // W  = Σ(S·W)
  daily: number; // kWh = Σ(S·W·H)/1000
  monthly: number; // kWh = daily × 30
  bill: number; // ₹ = monthly × R
  ranking: RankedAppliance[];
}

/** Monthly energy of one appliance if it were ON: W × H × 30 / 1000 */
export const monthlyKwh = (a: Appliance): number => (a.watts * a.hours * DAYS_PER_MONTH) / 1000;
export const monthlyCost = (a: Appliance, rate: number): number => monthlyKwh(a) * rate;

export function summarize(state: HomeState): Summary {
  const active = APPLIANCES.filter((a) => state.on[a.id]);
  const power = active.reduce((s, a) => s + a.watts, 0);
  const daily = active.reduce((s, a) => s + a.watts * a.hours, 0) / 1000;
  const monthly = daily * DAYS_PER_MONTH;
  const bill = monthly * state.rate;
  const ranking = APPLIANCES.map((a) => {
    const kwh = state.on[a.id] ? monthlyKwh(a) : 0;
    return { appliance: a, monthlyKwh: kwh, monthlyCost: kwh * state.rate, share: monthly > 0 ? (kwh / monthly) * 100 : 0 };
  }).sort((x, y) => y.monthlyKwh - x.monthlyKwh);
  return { activeIds: active.map((a) => a.id), power, daily, monthly, bill, ranking };
}

/** Bill for a hypothetical set of ON appliances (used by the outage selector). */
export function billFor(ids: ApplianceId[], rate: number): number {
  return APPLIANCES.filter((a) => ids.includes(a.id)).reduce((s, a) => s + monthlyCost(a, rate), 0);
}

export type TargetStatus = "below" | "equal" | "above";
export function targetStatus(bill: number, target: number): { status: TargetStatus; diff: number; pct: number } {
  const diff = target - bill;
  const status: TargetStatus = Math.abs(diff) < 0.005 ? "equal" : diff > 0 ? "below" : "above";
  return { status, diff, pct: (bill / target) * 100 };
}

/** Validates the target input: must be a finite number greater than zero. */
export function parseTarget(raw: string): number | null {
  if (raw.trim() === "") return null;
  const v = Number(raw);
  return Number.isFinite(v) && v > 0 ? v : null;
}

export const f2 = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const f0 = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
