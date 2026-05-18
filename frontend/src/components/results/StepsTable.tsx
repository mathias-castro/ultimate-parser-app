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

export default function StepsTable({ steps }: Props) {
  if (steps.length === 0) return null;

  const showSymbols = steps.some((s) => s.symbols !== "");

  return (
    <Card
      icon="↳"
      title="Proceso paso a paso"
      subtitle={`${steps.length} pasos`}
    >
      <p className="section-note">
        Sigue cómo evoluciona la <strong>pila</strong> mientras se consume la{" "}
        <strong>entrada</strong>. La etiqueta de color resume el tipo de acción.
      </p>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Pila</th>
              {showSymbols && <th>Símbolos</th>}
              <th>Entrada</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, i) => {
              const chip = chipFor(step.action);
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="cell-mono">{step.stack}</td>
                  {showSymbols && (
                    <td className="cell-mono">{step.symbols || "·"}</td>
                  )}
                  <td className="cell-mono">{step.input}</td>
                  <td>
                    <div className="step-action">
                      <span className={`chip ${chip.cls}`}>{chip.label}</span>
                      <span>{step.action}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
