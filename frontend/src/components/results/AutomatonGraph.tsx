import { useState } from "react";
import Card from "../ui/Card";
import type { LrState, Transition } from "../../types/parser";

interface Props {
  states: LrState[];
  transitions: Transition[];
}

const COL_W = 240;
const ROW_H = 120;
const NODE_W = 96;
const NODE_H = 50;
const HW = NODE_W / 2;
const HH = NODE_H / 2;
const PAD = 50;

interface Pt {
  x: number;
  y: number;
}

// Cubic Bezier point at t (for placing the edge label).
function bezier(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

export default function AutomatonGraph({ states, transitions }: Props) {
  if (states.length === 0) return null;

  const [selected, setSelected] = useState<{ state: LrState; x: number; y: number } | null>(null);

  const names = states.map((s) => s.name);

  // 1. Adjacency for the BFS layering.
  const adj = new Map<string, string[]>();
  names.forEach((n) => adj.set(n, []));
  transitions.forEach((t) => {
    if (adj.has(t.from)) adj.get(t.from)!.push(t.to);
  });

  // 2. Assign a level (column) = shortest distance from the start state.
  const level = new Map<string, number>();
  const start = names.includes("I0") ? "I0" : names[0];
  level.set(start, 0);
  const queue = [start];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    const lv = level.get(cur)!;
    for (const next of adj.get(cur) ?? []) {
      if (!level.has(next)) {
        level.set(next, lv + 1);
        queue.push(next);
      }
    }
  }
  // Any unreachable state goes after the deepest level.
  let maxLevel = 0;
  level.forEach((v) => (maxLevel = Math.max(maxLevel, v)));
  names.forEach((n) => {
    if (!level.has(n)) level.set(n, maxLevel + 1);
  });
  maxLevel = 0;
  level.forEach((v) => (maxLevel = Math.max(maxLevel, v)));

  // 3. Group nodes by level and place them in a centered column.
  const byLevel = new Map<number, string[]>();
  names.forEach((n) => {
    const lv = level.get(n)!;
    if (!byLevel.has(lv)) byLevel.set(lv, []);
    byLevel.get(lv)!.push(n);
  });

  let maxRows = 1;
  byLevel.forEach((arr) => (maxRows = Math.max(maxRows, arr.length)));

  const pos = new Map<string, Pt>();
  byLevel.forEach((arr, lv) => {
    const colHeight = arr.length * ROW_H;
    const totalHeight = maxRows * ROW_H;
    const yStart = (totalHeight - colHeight) / 2;
    arr.forEach((n, i) => {
      pos.set(n, {
        x: PAD + lv * COL_W + NODE_W / 2,
        y: PAD + yStart + i * ROW_H + NODE_H / 2,
      });
    });
  });

  const width = PAD * 2 + maxLevel * COL_W + NODE_W;
  const height = PAD * 2 + maxRows * ROW_H;

  // 4. Merge transitions that share the same (from, to) into one edge
  //    with a combined label ("c, d") to remove duplicate lines.
  const edgeMap = new Map<string, { from: string; to: string; syms: string[] }>();
  transitions.forEach((t) => {
    const key = `${t.from}::${t.to}`;
    if (!edgeMap.has(key)) {
      edgeMap.set(key, { from: t.from, to: t.to, syms: [] });
    }
    edgeMap.get(key)!.syms.push(t.symbol);
  });
  const edges = [...edgeMap.values()];

  return (
    <Card
      icon="◉"
      title="Diagrama del autómata LR"
      subtitle={`${states.length} estados · ${transitions.length} transiciones`}
    >
      <div className="graph-wrapper">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="automaton-svg"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="6.5"
              markerHeight="6.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#9aa0b8" />
            </marker>
          </defs>

          {edges.map((e, i) => {
            const a = pos.get(e.from)!;
            const b = pos.get(e.to)!;
            const label = e.syms.join(", ");
            const la = level.get(e.from)!;
            const lb = level.get(e.to)!;

            let p0: Pt;
            let p1: Pt;
            let p2: Pt;
            let p3: Pt;

            if (e.from === e.to) {
              // Self-loop on top of the node.
              p0 = { x: a.x - 14, y: a.y - HH };
              p1 = { x: a.x - 30, y: a.y - HH - 52 };
              p2 = { x: a.x + 30, y: a.y - HH - 52 };
              p3 = { x: a.x + 14, y: a.y - HH };
            } else if (lb > la) {
              // Forward edge: clean left-to-right flow curve.
              p0 = { x: a.x + HW, y: a.y };
              p3 = { x: b.x - HW, y: b.y };
              const mx = (p0.x + p3.x) / 2;
              p1 = { x: mx, y: p0.y };
              p2 = { x: mx, y: p3.y };
            } else if (lb === la) {
              // Same column: bow out to the right side.
              const bow = 60;
              p0 = { x: a.x + HW, y: a.y };
              p3 = { x: b.x + HW, y: b.y };
              p1 = { x: a.x + HW + bow, y: a.y };
              p2 = { x: b.x + HW + bow, y: b.y };
            } else {
              // Backward edge: arc underneath everything so it stays clear.
              const dip = 70 + (la - lb) * 26;
              p0 = { x: a.x, y: a.y + HH };
              p3 = { x: b.x, y: b.y + HH };
              p1 = { x: a.x, y: a.y + HH + dip };
              p2 = { x: b.x, y: b.y + HH + dip };
            }

            const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
            const m = bezier(p0, p1, p2, p3, 0.5);
            const lw = label.length * 6.6 + 10;

            return (
              <g key={i} className="edge">
                <path className="edge-path" d={d} markerEnd="url(#arrow)" />
                <rect
                  className="edge-label-bg"
                  x={m.x - lw / 2}
                  y={m.y - 9}
                  width={lw}
                  height={18}
                  rx={5}
                />
                <text className="edge-label" x={m.x} y={m.y + 4} textAnchor="middle">
                  {label}
                </text>
              </g>
            );
          })}

          {states.map((s) => {
            const p = pos.get(s.name)!;
            const isSelected = selected?.state.name === s.name;
            return (
              <g
                key={s.name}
                className="node-clickable"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(isSelected ? null : { state: s, x: e.clientX, y: e.clientY });
                }}
              >
                <rect
                  x={p.x - HW}
                  y={p.y - HH}
                  width={NODE_W}
                  height={NODE_H}
                  rx="12"
                  className={isSelected ? "node-rect node-selected" : "node-rect"}
                />
                <text
                  x={p.x}
                  y={p.y - 3}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="node-label"
                >
                  {s.name}
                </text>
                <text x={p.x} y={p.y + 13} textAnchor="middle" className="node-sub">
                  {s.items.length} ítems
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selected && (
        <div
          className="state-popup"
          style={{ left: selected.x + 14, top: selected.y - 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="state-popup-header">
            <span className="state-popup-name">{selected.state.name}</span>
            <button className="state-detail-close" onClick={() => setSelected(null)}>✕</button>
          </div>
          <ul className="state-detail-items">
            {selected.state.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
