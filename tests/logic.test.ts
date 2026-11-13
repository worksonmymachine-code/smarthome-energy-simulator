import { describe, expect, it } from "vitest";
import { byId } from "@/lib/appliances";
import { parseTarget, summarize, targetStatus, monthlyKwh } from "@/lib/energy";
import { confirmPowerCut, endPowerCut, initialState, replaceActive, requestToggle, activeIds } from "@/lib/powerCut";
import { reducer } from "@/lib/reducer";
import { saverCandidates, applySaver } from "@/lib/saver";

describe("energy engine", () => {
  it("matches the PRD formulas with all appliances ON", () => {
    const s = summarize(initialState());
    expect(s.power).toBe(2435);
    expect(s.daily).toBeCloseTo(12.38, 5);
    expect(s.monthly).toBeCloseTo(371.4, 5);
    expect(s.bill).toBeCloseTo(2785.5, 5);
  });
  it("is zero when everything is OFF", () => {
    let s = initialState();
    for (const id of activeIds(s)) s = reducer(s, { type: "toggle", id });
    const sum = summarize(s);
    expect([sum.power, sum.daily, sum.monthly, sum.bill]).toEqual([0, 0, 0, 0]);
    expect(sum.ranking.every((r) => r.share === 0)).toBe(true);
  });
  it("ranks AC first and shares sum to 100%", () => {
    const s = summarize(initialState());
    expect(s.ranking[0].appliance.id).toBe("ac");
    expect(s.ranking.reduce((a, r) => a + r.share, 0)).toBeCloseTo(100, 8);
    expect(monthlyKwh(byId("ac"))).toBe(270);
    expect((byId("ac").watts * 30 / 1000) * 7.5).toBeCloseTo(337.5); // one hour less AC per day = 45 kWh/month = ₹337.50
  });
  it("reports target states", () => {
    expect(targetStatus(2785.5, 3000).status).toBe("below");
    expect(targetStatus(3000, 3000).status).toBe("equal");
    expect(targetStatus(3500, 3000).status).toBe("above");
  });
  it("rejects invalid targets", () => {
    for (const bad of ["", " ", "0", "-5", "abc", "Infinity"]) expect(parseTarget(bad)).toBeNull();
    expect(parseTarget("2500")).toBe(2500);
    const s = initialState();
    expect(reducer(s, { type: "setTarget", value: 0 }).target).toBe(3000);
  });
});

describe("Power Cut (Minute 40 twist)", () => {
  it("requires exactly three distinct appliances", () => {
    const s = initialState();
    for (const ids of [[], ["ac"], ["ac", "fr"], ["ac", "fr", "fan", "tv"], ["ac", "ac", "fr"]] as const)
      expect(confirmPowerCut(s, [...ids]).ok).toBe(false);
    const r = confirmPowerCut(s, ["fr", "fan", "led"]);
    expect(r.ok && activeIds(r.next)).toEqual(["fr", "fan", "led"]);
    expect(r.ok && r.next.powerCut).toBe(true);
  });
  it("turns ON a selected appliance that was OFF and switches the rest OFF", () => {
    let s = initialState();
    s = reducer(s, { type: "toggle", id: "tv" });
    s = reducer(s, { type: "confirmPowerCut", ids: ["tv", "fr", "led"] });
    expect(activeIds(s)).toEqual(["fr", "led", "tv"]);
  });
  it("blocks a fourth appliance and a lone switch-OFF; offers a swap instead", () => {
    const s = reducer(initialState(), { type: "confirmPowerCut", ids: ["fr", "fan", "led"] });
    expect(requestToggle(s, "ac").kind).toBe("swap");
    expect(requestToggle(s, "fr").kind).toBe("blocked");
    expect(reducer(s, { type: "toggle", id: "ac" })).toBe(s); // enforced in the reducer too
    expect(reducer(s, { type: "toggle", id: "fr" })).toBe(s);
  });
  it("replaces one appliance keeping exactly three ON", () => {
    let s = reducer(initialState(), { type: "confirmPowerCut", ids: ["fr", "fan", "led"] });
    s = reducer(s, { type: "replace", out: "fan", incoming: "tv" });
    expect(activeIds(s)).toEqual(["fr", "led", "tv"]);
    expect(replaceActive(s, "ac", "wm").ok).toBe(false); // ac is not active
  });
  it("ends the outage and preserves states", () => {
    const s = reducer(initialState(), { type: "confirmPowerCut", ids: ["fr", "fan", "led"] });
    const e = endPowerCut(s);
    expect(e.powerCut).toBe(false);
    expect(activeIds(e)).toEqual(["fr", "fan", "led"]);
    expect(requestToggle(e, "ac").kind).toBe("applied");
  });
  it("recalculates the bill after confirming", () => {
    const s = reducer(initialState(), { type: "confirmPowerCut", ids: ["fr", "fan", "led"] });
    expect(summarize(s).bill).toBeCloseTo(((200 * 8 + 75 * 8 + 40 * 5) / 1000) * 30 * 7.5, 5);
  });
});

describe("Energy saver rules", () => {
  it("never switches off the fridge or lights", () => {
    const s = applySaver(initialState());
    expect(saverCandidates(initialState()).map((a) => a.id)).toEqual(["ac", "fan", "tv", "wm"]);
    expect(activeIds(s)).toEqual(["fr", "led"]);
    expect(reducer({ ...initialState(), powerCut: true }, { type: "saver" }).powerCut).toBe(true);
  });
});
