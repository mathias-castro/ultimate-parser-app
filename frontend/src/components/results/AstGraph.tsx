import React, { useMemo, useRef, useState } from "react";
import type { AstNode } from "../../types/parser";

interface PositionedNode {
  id: string;
  label: string;
  kind: "terminal" | "nonterminal";
  x: number;
  y: number;
  depth: number;
  children: string[];
}

interface Props {
  ast: AstNode;
}

const H_SPACING = 90;
const V_SPACING = 80;
const NODE_PADDING_Y = 6;

function buildPositions(root: AstNode) {
  const nodes: Record<string, PositionedNode> = {};
  let leafIndex = 0;

  function visit(node: AstNode, depth: number, path: number[]) {
    const id = path.join("-");
    const childrenIds: string[] = [];
    nodes[id] = {
      id,
      label: node.label,
      kind: (node.kind ?? "nonterminal") as "terminal" | "nonterminal",
      x: 0,
      y: depth * V_SPACING,
      depth,
      children: childrenIds,
    };

    if (!node.children || node.children.length === 0) {
      const x = leafIndex * H_SPACING;
      nodes[id].x = x;
      leafIndex += 1;
    } else {
      node.children.forEach((c, i) => {
        const childId = visit(c, depth + 1, [...path, i]);
        childrenIds.push(childId);
      });
      // center above children
      const first = nodes[childrenIds[0]].x;
      const last = nodes[childrenIds[childrenIds.length - 1]].x;
      nodes[id].x = (first + last) / 2;
    }
    return id;
  }

  visit(root, 0, [0]);
  return nodes;
}

export default function AstGraph({ ast }: Props) {
  const nodes = useMemo(() => buildPositions(ast), [ast]);

  const all = Object.values(nodes);
  const minX = Math.min(...all.map((n) => n.x));
  const maxX = Math.max(...all.map((n) => n.x));
  const maxY = Math.max(...all.map((n) => n.y));

  const width = Math.max(300, maxX - minX + H_SPACING);
  const height = maxY + V_SPACING;

  const offsetX = H_SPACING / 2 - minX;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  function screenToSvg(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: clientX, y: clientY };
    const rect = svg.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.12 : 0.9;
    const mouse = screenToSvg(e.clientX, e.clientY);
    const svgX = (mouse.x - pan.x) / scale;
    const svgY = (mouse.y - pan.y) / scale;
    const newScale = Math.max(0.2, Math.min(3, scale * factor));
    const newPanX = mouse.x - svgX * newScale;
    const newPanY = mouse.y - svgY * newScale;
    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
  }

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }

  function onMouseUp() {
    dragging.current = false;
  }

  function resetView() {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }

  return (
    <div className="ast-graph-wrapper" style={{ overflow: "auto", position: "relative" }}>
      <div className="ast-zoom-controls">
        <button onClick={() => setScale((s) => Math.min(3, s * 1.2))}>+</button>
        <button onClick={() => setScale((s) => Math.max(0.2, s * 0.8))}>-</button>
        <button title="Reset view" onClick={resetView}>R</button>
      </div>

      <svg
        ref={svgRef}
        className="ast-graph-svg"
        width={width}
        height={height}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseUp}
        onMouseUp={onMouseUp}
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.12" />
          </filter>
        </defs>

        <g transform={`translate(${pan.x} ${pan.y}) scale(${scale})`}>
          {/* edges */}
          <g className="ast-edges" stroke="#cfd3e6" strokeWidth={1.6} fill="none">
            {all.map((n) =>
              n.children.map((cid) => {
                const c = nodes[cid];
                return (
                  <path
                    key={`${n.id}-${cid}`}
                    d={`M ${n.x + offsetX} ${n.y + NODE_PADDING_Y + 20} C ${n.x + offsetX} ${
                      n.y + (c.y - n.y) / 2
                    } ${c.x + offsetX} ${n.y + (c.y - n.y) / 2} ${c.x + offsetX} ${c.y - NODE_PADDING_Y}
                    `}
                  />
                );
              })
            )}
          </g>

          {/* nodes */}
          <g className="ast-nodes">
            {all.map((n) => {
              const x = n.x + offsetX;
              const y = n.y;
              const isTerminal = n.kind === "terminal";
              const text = n.label;
              return (
                <g key={n.id} transform={`translate(${x}, ${y})`}>
                  <rect
                    x={-60}
                    y={-12}
                    rx={10}
                    ry={10}
                    width={120}
                    height={24}
                    className={`node-rect ${isTerminal ? "node-term" : "node-nonterm"}`}
                    filter="url(#shadow)"
                  />
                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    fontFamily="var(--mono)"
                    fontSize={12}
                    fill={isTerminal ? "#14532d" : "#2c1368"}
                  >
                    {text}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}
