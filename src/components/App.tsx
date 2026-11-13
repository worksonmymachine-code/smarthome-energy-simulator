"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { byId, type ApplianceId } from "@/lib/appliances";
import { f0, summarize } from "@/lib/energy";
import { confirmPowerCut, initialState, replaceActive, requestToggle } from "@/lib/powerCut";
import { reducer } from "@/lib/reducer";
import { joinNames, saverCandidates } from "@/lib/saver";
import { monthlyCost } from "@/lib/energy";
import { Dashboard, type Actions } from "./Dashboard";
import { PowerCutDialog, SwapDialog } from "./PowerCutDialog";
import { SaverDialog, SimpleDashboard, SimpleEntry } from "./SimpleHome";

type View = "std" | "pin" | "simple";
type Note = { text: string; type: "ok" | "err" };

/** Owns the single shared state. Standard dashboard and SimpleHome both read and write through it. */
export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [view, setView] = useState<View>("std");
  const [outage, setOutage] = useState<null | "activate" | "change">(null);
  const [swapIn, setSwapIn] = useState<ApplianceId | null>(null);
  const [saverOpen, setSaverOpen] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sum = summarize(state);

  useEffect(() => { document.body.dataset.view = view; window.scrollTo(0, 0); }, [view]);
  const notify = useCallback((text: string, type: Note["type"] = "ok") => {
    setNote({ text, type });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(null), view === "simple" ? 8000 : 3800);
  }, [view]);

  const actions: Actions = {
    toggle: (id) => {
      const r = requestToggle(state, id);
      if (r.kind === "applied") { dispatch({ type: "toggle", id }); notify(r.message); }
      else if (r.kind === "swap") setSwapIn(r.incoming);
      else notify(r.message, "err");
    },
    setTarget: (value) => dispatch({ type: "setTarget", value }),
    openOutage: (mode) => setOutage(mode),
    endOutage: () => { dispatch({ type: "endPowerCut" }); notify("Power Cut ended. Limit removed; appliance states kept."); },
    reset: () => { dispatch({ type: "reset" }); setOutage(null); setSwapIn(null); setSaverOpen(false); notify("Simulation reset to defaults."); },
    enterSimple: () => setView("pin"),
  };
  const onPowerCutButton = () => (state.powerCut ? actions.endOutage() : setOutage("activate"));

  const confirmOutage = (ids: ApplianceId[]) => {
    const r = confirmPowerCut(state, ids);
    if (!r.ok) return notify(r.error, "err");
    dispatch({ type: "confirmPowerCut", ids });
    setOutage(null);
    notify(`Simulated outage active. ${joinNames(ids.map((i) => byId(i).name))} stay ON; everything else is OFF.`);
  };
  const confirmSwap = (out: ApplianceId) => {
    if (!swapIn) return;
    const r = replaceActive(state, out, swapIn);
    if (!r.ok) return notify(r.error, "err");
    dispatch({ type: "replace", out, incoming: swapIn });
    notify(`${byId(swapIn).name} is now ON and ${byId(out).name} is OFF. Exactly 3 appliances remain ON.`);
    setSwapIn(null);
  };
  const openSaver = () => {
    if (!saverCandidates(state).length) return notify("Nothing more to switch off. Only essential things are running.");
    setSaverOpen(true);
  };
  const confirmSaver = () => {
    const l = saverCandidates(state);
    const saved = l.reduce((s, a) => s + monthlyCost(a, state.rate), 0);
    dispatch({ type: "saver" });
    setSaverOpen(false);
    notify(`Done! We switched off the ${joinNames(l.map((a) => a.simpleName))}. This could save you about ₹${f0(saved)} a month.`);
  };

  return (
    <>
      {view === "std" && <Dashboard state={state} sum={sum} actions={actions} />}
      {view === "pin" && <SimpleEntry onBack={() => setView("std")} onSuccess={() => { setView("simple"); notify("Welcome! You are in SimpleHome."); }} />}
      {view === "simple" && <SimpleDashboard state={state} sum={sum} note={note} onBack={() => setView("std")} onToggle={actions.toggle} onSaver={openSaver} onPowerCut={onPowerCutButton} />}
      {outage && <PowerCutDialog state={state} mode={outage} onConfirm={confirmOutage} onCancel={() => setOutage(null)} />}
      {swapIn && <SwapDialog state={state} incoming={swapIn} onSwap={confirmSwap} onCancel={() => setSwapIn(null)} />}
      {saverOpen && <SaverDialog state={state} onConfirm={confirmSaver} onCancel={() => { setSaverOpen(false); notify("No changes made."); }} />}
      {note && view !== "pin" && <div id="toast" className={note.type === "err" ? "err" : "ok"} style={{ display: "block" }} role="status" aria-live="polite">{note.text}</div>}
    </>
  );
}
