import { useEffect, useRef, useState } from "react";
import Card from "../ui/Card";
import type { ParseStepRow } from "../../types/parser";

interface Props {
  steps: ParseStepRow[];
}

function chipFor(action: string): { cls: string; label: string } {
  const a = action.toLowerCase();
  if (a.startsWith("shift")) return { cls: "chip-shift", label: "SHIFT" };
  if (a.startsWith("reduce")) return { cls: "chip-reduce", label: "REDUCE" };
  if (a.startsWith("match")) return { cls: "chip-match", label: "MATCH" };
  if (a.startsWith("aplicar")) return { cls: "chip-apply", label: "APLICAR" };
  if (a.startsWith("aceptar") || a.includes("consumida"))
    return { cls: "chip-accept", label: "ACEPTAR" };
  if (a.startsWith("error") || a.includes("rechaz"))
    return { cls: "chip-error", label: "ERROR" };
  if (a.startsWith("consume")) return { cls: "chip-match", label: "MATCH" };
  return { cls: "chip-info", label: "PASO" };
}

function tokens(text: string): string[] {
  return text.split(/\s+/).filter((t) => t.length > 0);
}

export default function StepsPlayer({ steps }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  const total = steps.length;
  const showSymbols = steps.some((s) => s.symbols !== "");

  // Reset when a new analysis loads.
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!playing) return;
    if (index >= total - 1) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => setIndex((i) => i + 1), 950);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, index, total]);

  if (total === 0) return null;

  const step = steps[index];
  const chip = chipFor(step.action);
  const stack = tokens(step.stack);
  const input = tokens(step.input);

  return (
    <Card
      icon="▶"
      title="Animación del análisis"
      subtitle={`Paso ${index + 1} de ${total}`}
    >
      <p className="section-note">
        Reproduce el análisis como una animación: observa cómo crece y decrece
        la <strong>pila</strong> mientras se consume la entrada.
      </p>

      <div className="player-stage">
        <div className="player-col">
          <div className="player-col__label">Pila</div>
          <div className="stack-viz">
            {stack.length === 0 && <span className="muted">(vacía)</span>}
            {stack.map((s, i) => (
              <span
                key={i}
                className={`stack-cell ${
                  i === stack.length - 1 ? "stack-top" : ""
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {showSymbols && (
          <div className="player-col">
            <div className="player-col__label">Símbolos</div>
            <div className="stack-viz">
              {tokens(step.symbols).length === 0 && (
                <span className="muted">·</span>
              )}
              {tokens(step.symbols).map((s, i) => (
                <span key={i} className="stack-cell sym">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="player-col">
          <div className="player-col__label">Entrada restante</div>
          <div className="input-viz">
            {input.map((t, i) => (
              <span
                key={i}
                className={`token ${i === 0 ? "token-current" : ""}`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="player-action">
        <span className={`chip ${chip.cls}`}>{chip.label}</span>
        <span>{step.action}</span>
      </div>

      <input
        className="player-scrub"
        type="range"
        min={0}
        max={total - 1}
        value={index}
        onChange={(e) => {
          setPlaying(false);
          setIndex(Number(e.target.value));
        }}
      />

      <div className="player-controls">
        <button
          className="btn"
          type="button"
          onClick={() => {
            setPlaying(false);
            setIndex(0);
          }}
        >
          ⏮ Reiniciar
        </button>
        <button
          className="btn"
          type="button"
          disabled={index === 0}
          onClick={() => {
            setPlaying(false);
            setIndex((i) => Math.max(0, i - 1));
          }}
        >
          ◀ Anterior
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            if (index >= total - 1) setIndex(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? "⏸ Pausar" : "▶ Reproducir"}
        </button>
        <button
          className="btn"
          type="button"
          disabled={index >= total - 1}
          onClick={() => {
            setPlaying(false);
            setIndex((i) => Math.min(total - 1, i + 1));
          }}
        >
          Siguiente ▶
        </button>
      </div>
    </Card>
  );
}
