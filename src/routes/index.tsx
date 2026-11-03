import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FluidGuard — Overfill Protection Console" },
      { name: "description", content: "Real-time 4-bit fluid threshold comparator with overfill alarm and session event log." },
      { property: "og:title", content: "FluidGuard — Overfill Protection Console" },
      { property: "og:description", content: "Hardware-level real-time fluid threshold & overfill protection simulator." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Bits = [boolean, boolean, boolean, boolean]; // index 0 = bit3
const toDec = (b: Bits) => b.reduce((acc, v, i) => acc + (v ? 1 << (3 - i) : 0), 0);
const fromDec = (n: number): Bits => [3, 2, 1, 0].map((i) => ((n >> i) & 1) === 1) as Bits;

type LogEntry = { id: number; time: string; a: number; b: number };

function BitPanel({ label, prefix, bits, setBits, tone }: {
  label: string; prefix: string; bits: Bits; setBits: (b: Bits) => void; tone: "teal" | "sage";
}) {
  const dec = toDec(bits);
  const activeTxt = tone === "teal" ? "text-teal" : "text-sage";
  const knobOn = tone === "teal"
    ? "bg-gradient-to-b from-teal/80 to-teal glow-teal"
    : "bg-gradient-to-b from-sage/80 to-sage glow-sage";
  const trackOn = tone === "teal" ? "bg-teal-soft border-teal/40" : "bg-sage-soft border-sage/40";
  return (
    <div className="panel p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            0b{bits.map((v) => (v ? "1" : "0")).join("")}
          </p>
        </div>
        <span className={`font-display text-5xl font-semibold ${activeTxt}`}>{dec.toString().padStart(2, "0")}</span>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {bits.map((v, i) => (
          <button
            key={i}
            onClick={() => { const n = [...bits] as Bits; n[i] = !n[i]; setBits(n); }}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${v ? trackOn : "bg-muted/60 hover:bg-muted"}`}
            aria-label={`${prefix}${3 - i}`}
          >
            <span className="text-xs font-medium text-muted-foreground">{prefix}{3 - i}</span>
            <span className={`relative h-14 w-8 rounded-full border shadow-inner transition-colors duration-200 ${v ? trackOn : "bg-input/60"}`}>
              <span className={`absolute left-1 h-6 w-6 rounded-full shadow-sm transition-all duration-300 ${v ? `top-1 ${knobOn}` : "top-7 bg-card"}`} />
            </span>
            <span className={`font-display text-sm font-semibold ${v ? activeTxt : "text-muted-foreground"}`}>{v ? 1 : 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Tank({ a, b, state }: { a: number; b: number; state: "eq" | "lt" | "gt" }) {
  const fill = (a / 15) * 100;
  const mark = (b / 15) * 100;
  const fluid = state === "gt"
    ? "bg-gradient-to-t from-terra/70 to-terra/40"
    : state === "eq"
      ? "bg-gradient-to-t from-sage/70 to-sage/40"
      : "bg-gradient-to-t from-teal/70 to-teal/40";
  return (
    <div className="panel flex h-full flex-col p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Reservoir</p>
      <div className="mt-4 flex flex-1 gap-3">
        <div className="flex flex-col justify-between py-1 text-[10px] font-medium text-muted-foreground">
          {[15, 12, 9, 6, 3, 0].map((n) => <span key={n}>{n}</span>)}
        </div>
        <div className={`relative min-h-[420px] flex-1 overflow-hidden rounded-3xl border-2 bg-muted/40 shadow-inner transition-colors duration-500 ${state === "gt" ? "border-terra/50 animate-ring" : "border-border"}`}>
          <div className={`absolute inset-x-0 bottom-0 transition-all duration-700 ease-out ${fluid}`} style={{ height: `${fill}%` }}>
            {a > 0 && <div className="absolute inset-x-0 top-0 h-1.5 rounded-full bg-foreground/20" />}
          </div>
          <div className="absolute inset-x-0 transition-all duration-500" style={{ bottom: `${mark}%` }}>
            <div className="border-t-2 border-dashed border-gold" />
            <span className="absolute right-2 -top-6 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-semibold text-gold shadow-sm">LIMIT {b}</span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center font-display text-sm text-muted-foreground">
        LEVEL <span className="font-semibold text-teal">{Math.round(fill)}%</span>
      </p>
    </div>
  );
}

function StatusCard({ active, title, cond, tone }: { active: boolean; title: string; cond: string; tone: "sage" | "gold" | "terra" }) {
  const styles = {
    sage: { card: "bg-sage-soft border-sage/40", led: "bg-sage glow-sage", txt: "text-sage" },
    gold: { card: "bg-gold-soft border-gold/40", led: "bg-gold glow-gold", txt: "text-gold" },
    terra: { card: "bg-terra-soft border-terra/40", led: "bg-terra glow-terra animate-alarm", txt: "text-terra" },
  }[tone];
  return (
    <div className={`panel flex items-center gap-4 p-4 transition-all duration-300 ${active ? styles.card : "opacity-50"}`}>
      <span className={`h-5 w-5 shrink-0 rounded-full ${active ? styles.led : "bg-input"}`} />
      <div className="min-w-0">
        <p className="font-mono text-xs text-muted-foreground">{cond}</p>
        <p className={`font-display text-sm font-semibold ${active ? styles.txt : "text-muted-foreground"}`}>{title}</p>
      </div>
    </div>
  );
}

function Index() {
  const [aBits, setABits] = useState<Bits>(fromDec(6));
  const [bBits, setBBits] = useState<Bits>(fromDec(10));
  const [log, setLog] = useState<LogEntry[]>([]);
  const a = toDec(aBits), b = toDec(bBits);
  const state: "eq" | "lt" | "gt" = a === b ? "eq" : a < b ? "lt" : "gt";
  const prev = useRef(state);
  const idRef = useRef(0);

  useEffect(() => {
    if (state === "gt" && prev.current !== "gt") {
      setLog((l) => [{ id: ++idRef.current, time: new Date().toLocaleTimeString([], { hour12: false }) + "." + String(new Date().getMilliseconds()).padStart(3, "0"), a, b }, ...l].slice(0, 25));
    }
    prev.current = state;
  }, [state, a, b]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal">FluidGuard · 4-bit Magnitude Comparator</p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight md:text-4xl">Real-Time Fluid Threshold &amp; Overfill Protection</h1>
        </div>
        <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold shadow-sm ${state === "gt" ? "border-terra/40 bg-terra-soft text-terra" : "border-sage/40 bg-sage-soft text-sage"}`}>
          <span className={`h-2 w-2 rounded-full ${state === "gt" ? "bg-terra animate-alarm" : "bg-sage glow-sage"}`} />
          {state === "gt" ? "ALARM ACTIVE" : "SYSTEM NOMINAL"}
        </div>
      </header>

      {state === "gt" && (
        <div className="mb-6 rounded-2xl border border-terra/40 bg-terra-soft p-4 text-center font-display text-sm font-semibold text-terra shadow-sm animate-alarm">
          Critical Overfill — Level {a} exceeds limit {b} — Inlet valve shutoff engaged
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <BitPanel label="Input A · Sensor Level" prefix="A" bits={aBits} setBits={setABits} tone="teal" />
            <BitPanel label="Input B · Threshold Limit" prefix="B" bits={bBits} setBits={setBBits} tone="sage" />
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">System State Monitor</p>
            <div className="grid gap-4 md:grid-cols-3">
              <StatusCard active={state === "eq"} title="Optimal" cond="A = B" tone="sage" />
              <StatusCard active={state === "lt"} title="Refill Needed" cond="A < B" tone="gold" />
              <StatusCard active={state === "gt"} title="Critical Overfill" cond="A > B" tone="terra" />
            </div>
          </div>

          <div className="panel p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Session Log · Overfill Triggers</p>
              <button onClick={() => setLog([])} className="rounded-full border bg-card px-4 py-1 text-xs font-semibold text-muted-foreground shadow-sm transition hover:text-foreground hover:shadow">Clear</button>
            </div>
            <div className="max-h-64 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b"><th className="py-2">#</th><th>Timestamp</th><th>Level A</th><th>Limit B</th><th>Excess</th></tr>
                </thead>
                <tbody>
                  {log.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No overfill events recorded.</td></tr>
                  ) : log.map((e) => (
                    <tr key={e.id} className="border-b border-border/60">
                      <td className="py-2 text-muted-foreground">{String(e.id).padStart(3, "0")}</td>
                      <td className="font-mono text-xs">{e.time}</td>
                      <td className="font-semibold text-teal">{e.a}</td>
                      <td className="font-semibold text-sage">{e.b}</td>
                      <td className="font-semibold text-terra">+{e.a - e.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Tank a={a} b={b} state={state} />
      </div>
    </main>
  );
}
