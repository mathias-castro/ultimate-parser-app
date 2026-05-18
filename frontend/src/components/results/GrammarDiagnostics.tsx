import Card from "../ui/Card";
import type { GrammarAnalysis } from "../../types/parser";

interface Props {
  analysis: GrammarAnalysis;
}

function Row({
  kind,
  label,
  value,
}: {
  kind: "ok" | "warn" | "info";
  label: string;
  value: string;
}) {
  return (
    <div className="diag-row">
      <span className={`diag-dot ${kind}`} />
      <span className="diag-k">{label}</span>
      <span className="diag-v">{value}</span>
    </div>
  );
}

export default function GrammarDiagnostics({ analysis }: Props) {
  return (
    <Card icon="·" title="Diagnóstico de la gramática">
      <div className="diag-list">
        <Row
          kind={analysis.left_recursion.length === 0 ? "ok" : "warn"}
          label="Recursión por la izquierda"
          value={
            analysis.left_recursion.length === 0
              ? "No detectada"
              : analysis.left_recursion.join("  ·  ")
          }
        />
        <Row
          kind={analysis.common_prefixes.length === 0 ? "ok" : "warn"}
          label="Prefijos comunes (factorización)"
          value={
            analysis.common_prefixes.length === 0
              ? "No detectados"
              : analysis.common_prefixes.join("  ·  ")
          }
        />
        <Row
          kind="info"
          label="No terminales anulables (→ ε)"
          value={
            analysis.nullable.length === 0
              ? "Ninguno"
              : analysis.nullable.join(", ")
          }
        />
      </div>
      {analysis.notes.length > 0 && (
        <p className="diag-note">{analysis.notes[0]}</p>
      )}
    </Card>
  );
}
