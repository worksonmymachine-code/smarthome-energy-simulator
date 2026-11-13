"use client";
import { useEffect, useState } from "react";
import { APPLIANCES, byId, type ApplianceId } from "@/lib/appliances";
import { billFor, f0, f2, monthlyCost, type HomeState } from "@/lib/energy";
import { POWER_CUT_LIMIT, activeIds } from "@/lib/powerCut";

function useEscape(onCancel: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onCancel]);
}

/** Minute 40 Twist: the simulated outage. The user must manually choose exactly three appliances. */
export function PowerCutDialog({ state, mode, onConfirm, onCancel }: {
  state: HomeState; mode: "activate" | "change"; onConfirm: (ids: ApplianceId[]) => void; onCancel: () => void;
}) {
  // "change" pre-fills with the user's own current choice; "activate" starts empty (never auto-selects).
  const [sel, setSel] = useState<ApplianceId[]>(mode === "change" ? activeIds(state) : []);
  const [warn, setWarn] = useState("");
  useEscape(onCancel);
  const pick = (id: ApplianceId) => {
    if (sel.includes(id)) { setSel(sel.filter((x) => x !== id)); setWarn(""); }
    else if (sel.length >= POWER_CUT_LIMIT) setWarn(`Only ${POWER_CUT_LIMIT} appliances can stay ON. Untick one first.`);
    else { setSel([...sel, id]); setWarn(""); }
  };
  const ready = sel.length === POWER_CUT_LIMIT;
  const bill = billFor(sel, state.rate);
  return (
    <div className="ov"><div className="dlg wide" role="dialog" aria-modal="true" aria-labelledby="pcd-t">
      <h2 id="pcd-t">Simulated power outage</h2>
      <p className="note" style={{ margin: "8px 0 10px" }}>
        The grid is down in this simulation. Choose exactly {POWER_CUT_LIMIT} appliances to keep running; everything else will be switched OFF.
        Every appliance you keep adds to your bill, so you are trading comfort against cost: the air conditioner costs far more than the fridge, lights and fan combined.
      </p>
      {APPLIANCES.map((a) => (
        <label className="oc" key={a.id}>
          <input type="checkbox" checked={sel.includes(a.id)} onChange={() => pick(a.id)} />
          <span style={{ fontSize: 28 }} aria-hidden>{a.icon}</span>
          <span className="t"><b>{a.name}</b><i>{a.comfort}</i></span>
          <span className="p"><b>{a.watts} W</b><br />≈ ₹{f2(monthlyCost(a, state.rate))}/mo</span>
        </label>
      ))}
      <div className="sum"><span>Selected: {sel.length} of {POWER_CUT_LIMIT}</span><span>Bill with this choice: ₹{f2(bill)} (target ₹{f0(state.target)})</span></div>
      <div className="err" role="alert" style={{ color: "var(--bad)" }}>{warn}</div>
      <div className="cta" style={{ justifyContent: "flex-end", marginTop: 8 }}>
        <button className="btn sec" onClick={onCancel}>Cancel</button>
        <button className="btn" disabled={!ready} onClick={() => onConfirm(sel)}>Confirm outage</button>
      </div>
      <p className="note" style={{ marginTop: 14 }}>Simulation only: this app never controls real appliances or causes a real power outage.</p>
    </div></div>
  );
}

/** Replace one of the three active appliances with another, keeping exactly three ON. */
export function SwapDialog({ state, incoming, onSwap, onCancel }: {
  state: HomeState; incoming: ApplianceId; onSwap: (out: ApplianceId) => void; onCancel: () => void;
}) {
  useEscape(onCancel);
  const inn = byId(incoming);
  return (
    <div className="ov"><div className="dlg" role="dialog" aria-modal="true" aria-labelledby="sw-t">
      <h2 id="sw-t">Swap appliance</h2>
      <p className="note" style={{ margin: "8px 0 14px" }}>Power Cut allows exactly {POWER_CUT_LIMIT} appliances ON. To turn on the {inn.name}, choose which one it replaces.</p>
      <div style={{ display: "grid", gap: 10 }}>
        {activeIds(state).map((id) => (
          <button key={id} className="btn sec" onClick={() => onSwap(id)}>{byId(id).icon} Replace {byId(id).name}</button>
        ))}
        <button className="btn sec" onClick={onCancel} style={{ borderColor: "var(--hair)", color: "var(--ink)" }}>Cancel</button>
      </div>
    </div></div>
  );
}
