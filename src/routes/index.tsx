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
  label: string; prefix: string; bits: Bits; setBits: (b: Bits) => void; tone: "cyan" | "emerald";
}) {
  const dec = toDec(bits);
  const on = tone === "cyan" ? "bg-cyan glow-cyan" : "bg-emerald glow-emerald";
  const txt = tone === "cyan" ? "text-cyan" : "text-emerald";
  return (
    <div className="panel p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            0b{bits.map((v) => (v ? "1" : "0")).join("")}
          </p>
        </div>
        <span className={`font-display text-5xl font-bold text-glow ${txt}`}>{dec.toString().padStart(2, "0")}</span>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-3">
        {bits.map((v, i) => (
          <button
            key={i}
            onClick={() => { const n = [...bits] as Bits; n[i] = !n[i]; setBits(n); }}
            className="flex flex-col items-center gap-2 rounded-lg border bg-muted/50 p-3 transition hover:bg-muted"
            aria-label={`${prefix}${3 - i}`}
          >
            <span className="text-xs text-muted-foreground">{prefix}{3 - i}</span>
            <span className="relative h-14 w-7 rounded-full border bg-background">
              <span className={`absolute left-1 h-5 w-5 rounded-full transition-all duration-200 ${v ? `top-1 ${on}` : "top-8 bg-input"}`} />
            </span>
            <span className={`font-display text-sm ${v ? txt : "text-muted-foreground"}`}>{v ? 1 : 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Tank({ a, b, state }: { a: number; b: number; state: "eq" | "lt" | "gt" }) {
  const fill = (a / 15) * 100;
  const mark = (b / 15) * 100;
  const fluid = state === "gt" ? "bg-rose/70" : state === "eq" ? "bg-emerald/70" : "bg-cyan/70";
  return (
    <div className="panel flex h-full flex-col p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Reservoir</p>
      <div className="mt-4 flex flex-1 gap-3">
        <div className="flex flex-col justify-between py-1 text-[10px] text-muted-foreground">
          {[15, 12, 9, 6, 3, 0].map((n) => <span key={n}>{n}</span>)}
        </div>
        <div className={`relative min-h-[420px] flex-1 overflow-hidden rounded-xl border-2 bg-background/60 ${state === "gt" ? "border-rose animate-ring" : ""}`}>
          <div className={`absolute inset-x-0 bottom-0 transition-all duration-700 ease-out ${fluid}`} style={{ height: `${fill}%` }}>
            {a > 0 && (
              <div className="absolute -top-2 left-0 h-4 w-[200%] animate-wave opacity-70"
                style={{ background: "radial-gradient(circle at 10px -2px, transparent 10px, currentColor 11px) repeat-x", backgroundSize: "20px 16px" }}>
                <div className={`h-full w-full ${fluid} [mask:radial-gradient(circle_at_10px_-2px,transparent_9px,black_10px)_repeat-x] [mask-size:20px_16px]`} />
              </div>
            )}
          </div>
          <div className="absolute inset-x-0 transition-all duration-500" style={{ bottom: `${mark}%` }}>
            <div className="border-t-2 border-dashed border-amber" />
            <span className="absolute right-2 -top-6 rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-amber">LIMIT {b}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center font-display text-sm text-muted-foreground">
        LEVEL <span className="text-cyan text-glow">{Math.round(fill)}%</span>
      </p>
    </div>
  );
}

function StatusCard({ active, title, cond, tone }: { active: boolean; title: string; cond: string; tone: "emerald" | "amber" | "rose" }) {
  const led = { emerald: "bg-emerald glow-emerald", amber: "bg-amber glow-amber", rose: "bg-rose glow-rose animate-alarm" }[tone];
  const txt = { emerald: "text-emerald", amber: "text-amber", rose: "text-rose" }[tone];
  const border = { emerald: "border-emerald/60", amber: "border-amber/60", rose: "border-rose/70" }[tone];
  return (
    <div className={`panel flex items-center gap-4 p-4 transition-all duration-300 ${active ? border : "opacity-40"}`}>
      <span className={`h-5 w-5 shrink-0 rounded-full ${active ? led : "bg-input"}`} />
      <div className="min-w-0">
        <p className="font-display text-xs text-muted-foreground">{cond}</p>
        <p className={`font-display text-sm font-semibold uppercase tracking-wider ${active ? `${txt} text-glow` : ""}`}>{title}</p>
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
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-cyan">FluidGuard · 4-bit Magnitude Comparator</p>
          <h1 className="mt-2 font-display text-2xl font-bold md:text-4xl">Real-Time Fluid Threshold &amp; Overfill Protection</h1>
        </div>
        <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs ${state === "gt" ? "border-rose text-rose" : "text-emerald"}`}>
          <span className={`h-2 w-2 rounded-full ${state === "gt" ? "bg-rose animate-alarm" : "bg-emerald glow-emerald"}`} />
          {state === "gt" ? "ALARM ACTIVE" : "SYSTEM NOMINAL"}
        </div>
      </header>

      {state === "gt" && (
        <div className="mb-6 rounded-xl border border-rose bg-rose/10 p-4 text-center font-display text-sm uppercase tracking-widest text-rose text-glow animate-alarm">
          ⚠ Critical Overfill — Level {a} exceeds limit {b} — Inlet valve shutoff engaged
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <BitPanel label="Input A · Sensor Level" prefix="A" bits={aBits} setBits={setABits} tone="cyan" />
            <BitPanel label="Input B · Threshold Limit" prefix="B" bits={bBits} setBits={setBBits} tone="emerald" />
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">System State Monitor</p>
            <div className="grid gap-4 md:grid-cols-3">
              <StatusCard active={state === "eq"} title="Optimal" cond="A = B" tone="emerald" />
              <StatusCard active={state === "lt"} title="Refill Needed" cond="A < B" tone="amber" />
              <StatusCard active={state === "gt"} title="Critical Overfill" cond="A > B" tone="rose" />
            </div>
          </div>

          <div className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Session Log · Overfill Triggers</p>
              <button onClick={() => setLog([])} className="rounded border px-3 py-1 text-xs text-muted-foreground hover:text-foreground">Clear</button>
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
                    <tr key={e.id} className="border-b border-border/50">
                      <td className="py-2 text-muted-foreground">{String(e.id).padStart(3, "0")}</td>
                      <td>{e.time}</td>
                      <td className="text-cyan">{e.a}</td>
                      <td className="text-emerald">{e.b}</td>
                      <td className="text-rose">+{e.a - e.b}</td>
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
