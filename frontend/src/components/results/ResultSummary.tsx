import Card from "../ui/Card";
import type { AnalyzeResponse } from "../../types/parser";

interface Props {
  result: AnalyzeResponse;
}

export default function ResultSummary({ result }: Props) {
  const hasConflicts = result.conflicts.length > 0;

  let badgeClass = "status-badge status-rejected";
  let label = "Cadena rechazada";
  if (hasConflicts) {
    badgeClass = "status-badge status-conflict";
    label = "Conflicto en la gramática";
  } else if (result.accepted) {
    badgeClass = "status-badge status-accepted";
    label = "Cadena aceptada";
  }

  return (
    <Card icon="●" title="Resultado">
      <div className="summary-row">
        <span className={badgeClass}>
          <span className="dot" />
          {label}
        </span>
        <span className="sep">·</span>
        <span className="summary-meta">{result.algorithm}</span>
      </div>

      <p className="message-line">{result.message}</p>

      {hasConflicts &&
        result.conflicts.map((c, i) => (
          <div className="conflict-box" key={i}>
            <strong>{c.type}</strong> en {c.cell} — <code>{c.existing}</code>{" "}
            vs <code>{c.new}</code>
          </div>
        ))}
    </Card>
  );
}
