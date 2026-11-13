"use client";
import { useEffect, useState } from "react";
import { APPLIANCES, ROOMS, type ApplianceId } from "@/lib/appliances";
import { f0, f2, monthlyCost, monthlyKwh, parseTarget, targetStatus, type HomeState, type Summary } from "@/lib/energy";
import { POWER_CUT_LIMIT } from "@/lib/powerCut";

export interface Actions {
  toggle: (id: ApplianceId) => void;
  setTarget: (v: number) => void;
  openOutage: (mode: "activate" | "change") => void;
  endOutage: () => void;
  reset: () => void;
  enterSimple: () => void;
}

export function Dashboard({ state, sum, actions }: { state: HomeState; sum: Summary; actions: Actions }) {
  const [raw, setRaw] = useState(String(state.target));
  const [err, setErr] = useState("");
  useEffect(() => { if (parseTarget(raw) !== state.target) { setRaw(String(state.target)); setErr(""); } }, [state.target]); // eslint-disable-line react-hooks/exhaustive-deps
  const onTarget = (v: string) => {
    setRaw(v);
    const n = parseTarget(v);
    if (n === null) setErr(`Enter a number greater than 0. Still using ₹${f2(state.target)}.`);
    else { setErr(""); actions.setTarget(n); }
  };
  const t = targetStatus(sum.bill, state.target);
  const cls = t.status === "equal" ? "eq" : t.status === "below" ? "" : "over";
  const top = sum.ranking[0];
  const n = sum.activeIds.length;
  return (
    <div id="std">
      <nav><div className="in">
        <b>⚡ SmartHome Energy</b>
        <span className={"pcb" + (state.powerCut ? " on" : "")}>{state.powerCut ? "Power Cut active · exactly 3" : "Normal supply"}</span>
        <span className="ng">
          <button className="util" onClick={actions.enterSimple}>SimpleHome Mode</button>
          <button className="util" onClick={actions.reset}>Reset simulation</button>
        </span>
      </div></nav>
      {state.powerCut && <div className="outage" role="status">⚠ Simulated power outage is ACTIVE: exactly {POWER_CUT_LIMIT} appliances are ON. This is a simulation; no real appliances are controlled.</div>}

      <section className="tile"><div className="in">
        <p className="kick">SmartHome Energy Simulator</p>
        <h1>See every watt.<br />Own your bill.</h1>
        <p className="lead">Switch appliances on and off and watch your projected electricity bill respond instantly.</p>
        <div className="cta">
          <a className="btn" href="#target">Set a target</a>
          <a className="btn sec" href="#powercut">Power Cut</a>
          <button className="btn sec" onClick={actions.enterSimple}>SimpleHome Mode</button>
        </div>
        <p className="cap" style={{ marginTop: 20 }}>{n ? `${n} of ${APPLIANCES.length} appliances running right now.` : "All appliances are OFF."}</p>
        <div className="met" aria-label="Energy overview" data-testid="metrics">
          <div><b data-testid="power">{f0(sum.power)} W</b><small>Active power</small></div>
          <div><b data-testid="daily">{f2(sum.daily)} kWh</b><small>Daily energy</small></div>
          <div><b data-testid="monthly">{f2(sum.monthly)} kWh</b><small>Monthly energy</small></div>
          <div><b data-testid="bill">₹{f2(sum.bill)}</b><small>Est. monthly bill</small></div>
          <div><b data-testid="count">{n} / {APPLIANCES.length}</b><small>Active appliances</small></div>
        </div>
      </div></section>

      <section className="tile par" id="house"><div className="in">
        <h2>Your home.</h2>
        <p className="lead">Six appliances. One tap each.</p>
        <div className="rooms">
          {ROOMS.map((r) => (
            <div className="room" key={r}><h3>{r}</h3>
              {APPLIANCES.filter((a) => a.room === r).map((a) => {
                const on = state.on[a.id], k = on ? monthlyKwh(a) : 0;
                return (
                  <div className={"ap" + (on ? " on" : "")} key={a.id}>
                    <div className="ic" aria-hidden>{a.icon}</div>
                    <div className="ai"><b>{a.name}</b>
                      <span>Rated {a.watts} W · {a.hours} h/day</span>
                      <span className="s">{on ? `ON · drawing ${a.watts} W` : "OFF · 0 W"} · {f2(k)} kWh/mo · ₹{f2(k * state.rate)}</span>
                    </div>
                    <button className="sw" role="switch" aria-checked={on} aria-label={a.name} onClick={() => actions.toggle(a.id)} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div></section>

      <section className="tile d1" id="target"><div className="in">
        <h2>Set your target.</h2>
        <p className="lead">Choose a monthly budget and see where you stand.</p>
        <div className="tgf"><label htmlFor="tg">Monthly target bill (₹)</label>
          <input id="tg" type="number" min="1" step="any" inputMode="decimal" value={raw} onChange={(e) => onTarget(e.target.value)} />
          <div className="err" id="tge" role="alert">{err}</div></div>
        <div className="prog">
          <div className="pl"><span>Projected ₹{f2(sum.bill)} of ₹{f2(state.target)}</span><b data-testid="pct">{t.pct.toFixed(1)}%</b></div>
          <div className={"bar " + cls} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(t.pct, 100))}><i style={{ width: `${Math.min(t.pct, 100)}%` }} /></div>
          <div className={"st " + cls} data-testid="target-status">
            {t.status === "equal" ? "Projected bill equals your target."
              : t.status === "below" ? `₹${f2(t.diff)} remaining.`
              : `⚠ Over target by ₹${f2(-t.diff)}. Reduce usage to get back on budget.`}
          </div>
        </div>
      </div></section>

      <section className="tile" id="breakdown"><div className="in">
        <h2>What costs the most.</h2>
        <p className="lead">Appliances ranked by projected monthly energy.</p>
        <div className="bd" data-testid="breakdown">
          {sum.monthly <= 0 ? <div className="empty">All appliances are OFF, so consumption and bill are zero.<br />Switch an appliance ON to see the breakdown.</div>
            : sum.ranking.map((r, i) => (
              <div className={"row" + (i === 0 ? " top" : "")} key={r.appliance.id}>
                <span className="n">{i + 1}</span>
                <div><span className="nm">{r.appliance.name}</span>{i === 0 && <span className="tag">Highest</span>}
                  <div className="bar"><i style={{ width: `${r.share}%` }} /></div></div>
                <span className="v"><b>{r.share.toFixed(1)}%</b><br />{f2(r.monthlyKwh)} kWh</span>
              </div>))}
        </div>
        {sum.monthly > 0 && (<>
          <div className="tip" data-testid="tip">Your {top.appliance.name.toLowerCase()} is your largest electricity consumer ({top.share.toFixed(1)}% of the projected total). Reducing its daily operating time by one hour could save approximately ₹{f2((top.appliance.watts * 30 / 1000) * state.rate)} per month under the current simulation assumptions.</div>
          {t.status === "above" && <div className="tip">You’re ₹{f2(-t.diff)} over target. Switching off the {top.appliance.name.toLowerCase()} entirely would save ₹{f2(top.monthlyCost)} per month.</div>}
        </>)}
      </div></section>

      <section className="tile d2" id="powercut"><div className="in">
        <h2>Power Cut.</h2>
        <p className="lead">Simulate an outage: you choose exactly three appliances to keep running.</p>
        <p className="pcs" data-testid="pc-status">{state.powerCut ? `Active · ${n} of ${POWER_CUT_LIMIT} appliances running` : "Inactive"}</p>
        <div className="cta">
          {state.powerCut ? (<>
            <button className="btn sec" onClick={() => actions.openOutage("change")}>Change selection</button>
            <button className="btn" onClick={actions.endOutage}>End outage</button>
          </>) : <button className="btn" onClick={() => actions.openOutage("activate")}>Start simulated outage</button>}
        </div>
        <p className="cap" style={{ marginTop: 16 }}>{state.powerCut ? "A 4th appliance can’t be switched ON; swap one instead. Ending the outage keeps the current appliance states." : "You will be asked to pick exactly 3 appliances. Nothing is chosen for you."}</p>
        <p className="cap">Simulation only: this app never controls real appliances.</p>
      </div></section>

      <footer><div className="in">Simplified projection using fictional wattage and usage assumptions at an illustrative tariff of ₹7.50/unit. This is not an actual utility bill or official electricity tariff.</div></footer>
    </div>
  );
}
