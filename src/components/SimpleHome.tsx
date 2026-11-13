"use client";
import { useEffect, useState } from "react";
import { APPLIANCES, type ApplianceId } from "@/lib/appliances";
import { f0, monthlyCost, type HomeState, type Summary } from "@/lib/energy";
import { POWER_CUT_LIMIT } from "@/lib/powerCut";
import { saverCandidates } from "@/lib/saver";

/** Fictional demo PIN. This is a simulated local check, NOT real authentication. */
export const DEMO_PIN = "1234";

export function SimpleEntry({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const press = (k: string) => {
    if (k === "clear") { setPin(""); setErr(""); return; }
    if (k === "del") { setPin(pin.slice(0, -1)); setErr(""); return; }
    if (pin.length >= 4) return;
    const next = pin + k;
    if (next.length < 4) { setPin(next); setErr(""); return; }
    if (next === DEMO_PIN) { onSuccess(); return; }
    setPin(""); setErr("That PIN is not right. Please try again.");
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === "Backspace") press("del");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "del"];
  return (
    <main id="pin"><div className="sw1">
      <button className="sbtn out back" onClick={onBack}>← Standard dashboard</button>
      <h1>SimpleHome</h1>
      <p className="sub1">Enter your 4-digit PIN</p>
      <div className="dots" role="img" aria-label={`${pin.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => <span key={i} className={"dot" + (i < pin.length ? " f" : "")} />)}
      </div>
      <div className="perr" role="alert">{err}</div>
      <div className="kp">
        {keys.map((k) => k === "clear" ? <button key={k} className="key t" onClick={() => press(k)}>Clear</button>
          : k === "del" ? <button key={k} className="key t" aria-label="Delete last digit" onClick={() => press(k)}>Delete</button>
          : <button key={k} className="key" onClick={() => press(k)}>{k}</button>)}
      </div>
      <p className="demo">Demo PIN: <b>{DEMO_PIN}</b>. This is a simulated PIN check for the prototype, not real security.</p>
    </div></main>
  );
}

export function SimpleDashboard({ state, sum, note, onBack, onToggle, onSaver, onPowerCut }: {
  state: HomeState; sum: Summary; note: { text: string; type: "ok" | "err" } | null;
  onBack: () => void; onToggle: (id: ApplianceId) => void; onSaver: () => void; onPowerCut: () => void;
}) {
  const diff = state.target - sum.bill, pct = (sum.bill / state.target) * 100;
  const over = sum.bill > state.target + 0.005, near = !over && pct >= 80;
  const cls = over ? "over" : near ? "near" : "good";
  const msg = over ? `Your bill is ₹${f0(sum.bill - state.target)} more than your budget. Try SAVE ELECTRICITY.`
    : near ? (Math.abs(diff) < 0.005 ? "Your bill has reached your budget." : "Your electricity bill is approaching your target.")
    : "Great! You are within your monthly budget.";
  const n = sum.activeIds.length;
  return (
    <main id="simple"><div className="sw1">
      <button className="sbtn out back" onClick={onBack}>← Standard dashboard</button>
      <h1>SimpleHome</h1>
      <p className="sub1">Your home, made simple.</p>
      {state.powerCut && <div className="outage s" role="status">⚠ Power Cut is ON. Exactly {POWER_CUT_LIMIT} things are running. This is a simulation.</div>}
      <div className={"snote" + (note ? ` ${note.type}` : "")} role="status" aria-live="polite">{note?.text}</div>
      <section className="sec1" aria-label="Electricity bill" data-testid="simple-bill">
        <p className="big">Your estimated electricity bill is <b>₹{f0(sum.bill)}</b>.</p>
        <p>Monthly budget: <b>₹{f0(state.target)}</b></p>
        <p>{diff >= 0 ? <>Left to spend: <b>₹{f0(diff)}</b></> : <>Over budget by: <b>₹{f0(-diff)}</b></>}</p>
        <div className={"sbar " + cls} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(pct, 100))}><i style={{ width: `${Math.min(pct, 100)}%` }} /></div>
        <p className={"smsg " + cls}>{over ? "✖" : near ? "!" : "✔"} {msg}</p>
      </section>
      <button className="sbtn sav" onClick={onSaver} disabled={state.powerCut}>SAVE ELECTRICITY</button>
      {state.powerCut && <p style={{ textAlign: "center", margin: "8px 0 0" }}>Not available during a Power Cut.</p>}
      <section className={"sec1" + (state.powerCut ? " pcw" : "")} aria-label="Power Cut">
        <p className="big"><b>Power Cut: {state.powerCut ? "ON" : "OFF"}</b></p>
        <p>{state.powerCut ? `Only ${POWER_CUT_LIMIT} things can run. ${n} of ${POWER_CUT_LIMIT} running now.` : `During a power cut, you pick ${POWER_CUT_LIMIT} things to keep on.`}</p>
        <button className={"sbtn" + (state.powerCut ? " out" : "")} onClick={onPowerCut}>{state.powerCut ? "Turn Power Cut OFF" : "Turn Power Cut ON"}</button>
      </section>
      <h2 style={{ textAlign: "center", marginTop: 28 }}>Your appliances</h2>
      <div className="sg">
        {APPLIANCES.map((a) => {
          const on = state.on[a.id];
          return (
            <div className={"sa" + (on ? " on" : "")} key={a.id} data-testid={`simple-${a.id}`}>
              <div className="sai" aria-hidden>{a.icon}</div>
              <h3>{a.simpleName}</h3>
              <p className="sst">{on ? "✔ ON" : "○ OFF"}</p>
              <button className={"sbtn" + (on ? " out" : "")} aria-label={`Turn ${on ? "off" : "on"} ${a.simpleName}`} onClick={() => onToggle(a.id)}>Turn {on ? "OFF" : "ON"}</button>
            </div>
          );
        })}
      </div>
    </div></main>
  );
}

export function SaverDialog({ state, onConfirm, onCancel }: { state: HomeState; onConfirm: () => void; onCancel: () => void }) {
  const off = saverCandidates(state);
  const keep = APPLIANCES.filter((a) => state.on[a.id] && a.essential);
  const saving = off.reduce((s, a) => s + monthlyCost(a, state.rate), 0);
  return (
    <div className="ov"><div className="dlg" role="dialog" aria-modal="true" aria-labelledby="sv-t">
      <h2 id="sv-t">Save electricity</h2>
      <p style={{ margin: "8px 0 4px" }}>We will switch these OFF:</p>
      <ul className="sl">{off.map((a) => <li key={a.id}>{a.icon} {a.simpleName}</li>)}</ul>
      {keep.length > 0 && <><p style={{ margin: "0 0 4px" }}>These stay ON for safety:</p><ul className="sl">{keep.map((a) => <li key={a.id}>{a.icon} {a.simpleName}</li>)}</ul></>}
      <p style={{ fontWeight: 600 }}>This could save you about ₹{f0(saving)} a month.</p>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <button className="sbtn" autoFocus onClick={onConfirm}>Yes, switch them OFF</button>
        <button className="sbtn out" onClick={onCancel}>No, keep everything</button>
      </div>
    </div></div>
  );
}
