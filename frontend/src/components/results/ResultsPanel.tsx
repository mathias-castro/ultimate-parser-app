import { useEffect, useMemo, useState } from "react";
import type { AnalyzeResponse } from "../../types/parser";
import ResultSummary from "./ResultSummary";
import GrammarDiagnostics from "./GrammarDiagnostics";
import FirstFollowTables from "./FirstFollowTables";
import ParserTable from "./ParserTable";
import ProductionLegend from "./ProductionLegend";
import AstViewer from "./AstViewer";
import StatesViewer from "./StatesViewer";
import AutomatonViewer from "./AutomatonViewer";
import AutomatonGraph from "./AutomatonGraph";
import StepsTable from "./StepsTable";
import StepsPlayer from "./StepsPlayer";
import ExplanationPanel from "./ExplanationPanel";

interface Props {
  result: AnalyzeResponse;
}

type TabId =
  | "grammar"
  | "sets"
  | "tables"
  | "ast"
  | "automaton"
  | "steps"
  | "explanation";

export default function ResultsPanel({ result }: Props) {
  const hasAnalysis = Boolean(result.grammar.analysis);
  const hasSets = Object.keys(result.first).length > 0;
  const hasLl1 = result.ll1_table.rows.length > 0;
  const hasLr =
    result.action_table.rows.length > 0 || result.goto_table.rows.length > 0;
  const hasTables = hasLl1 || hasLr;
  const hasAst = Boolean(result.ast);
  const hasAutomaton =
    result.states.length > 0 || result.transitions.length > 0;
  const hasSteps = result.steps.length > 0;

  const conflictCells = useMemo(() => {
    const cells = new Map<string, string>();
    for (const c of result.conflicts) {
      const ll1 = c.cell.match(/^M\[(.+),\s*(.+)\]$/);
      if (ll1) { cells.set(`${ll1[1]}|${ll1[2]}`, c.new); continue; }
      const lr = c.cell.match(/^ACTION\[(I\d+),\s*(.+)\]$/);
      if (lr) cells.set(`${lr[1]}|${lr[2]}`, c.new);
    }
    return cells;
  }, [result.conflicts]);

  const tabs = useMemo(() => {
    const list: { id: TabId; label: string; count?: number }[] = [];
    if (hasAnalysis) list.push({ id: "grammar", label: "Gramática" });
    if (hasSets) list.push({ id: "sets", label: "FIRST / FOLLOW" });
    if (hasTables) list.push({ id: "tables", label: "Tablas" });
    if (hasAst) list.push({ id: "ast", label: "AST" });
    if (hasAutomaton)
      list.push({
        id: "automaton",
        label: "Autómata",
        count: result.states.length || undefined,
      });
    if (hasSteps)
      list.push({ id: "steps", label: "Pasos", count: result.steps.length });
    list.push({ id: "explanation", label: "Explicación" });
    return list;
  }, [
    hasAnalysis,
    hasSets,
    hasTables,
    hasAst,
    hasAutomaton,
    hasSteps,
    result.states.length,
    result.steps.length,
  ]);

  const preferred: TabId = hasSteps
    ? "steps"
    : hasAst
      ? "ast"
    : hasTables
      ? "tables"
      : hasAnalysis
        ? "grammar"
        : "explanation";
  const [active, setActive] = useState<TabId>(preferred);
  const [stepsView, setStepsView] = useState<"anim" | "table">("anim");
  const [autoView, setAutoView] = useState<"graph" | "list">("graph");

  useEffect(() => {
    setActive(preferred);
    setStepsView("anim");
    setAutoView("graph");
  }, [result, preferred]);

  return (
    <>
      <ResultSummary result={result} />

      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab ${active === t.id ? "active" : ""}`}
            onClick={() => setActive(t.id)}
            type="button"
          >
            {t.label}
            {t.count !== undefined && <span className="count">{t.count}</span>}
          </button>
        ))}
      </div>

      {active === "grammar" && result.grammar.analysis && (
        <GrammarDiagnostics analysis={result.grammar.analysis} />
      )}

      {active === "sets" && (
        <FirstFollowTables first={result.first} follow={result.follow} />
      )}

      {active === "tables" && (
        <>
          {hasLr && (
            <div className="card">
              <ProductionLegend
                productions={result.grammar.productions ?? []}
              />
            </div>
          )}
          <ParserTable
            icon="▦"
            title="Tabla predictiva LL(1)"
            note="M[A, t] indica qué producción aplicar cuando la cima es A y el token es t."
            table={result.ll1_table}
            conflictCells={conflictCells}
          />
          <ParserTable
            icon="▤"
            title="Tabla ACTION"
            note="Acciones del parser: sN = shift, rN = reduce por la producción N, acc = aceptar."
            table={result.action_table}
            conflictCells={conflictCells}
          />
          <ParserTable
            icon="▥"
            title="Tabla GOTO"
            note="Estado al que se transita tras reducir a un no terminal."
            table={result.goto_table}
          />
        </>
      )}

      {active === "ast" && result.ast && <AstViewer ast={result.ast} />}

      {active === "automaton" && (
        <>
          <div className="segmented">
            <button
              className={autoView === "graph" ? "seg active" : "seg"}
              onClick={() => setAutoView("graph")}
              type="button"
            >
              ◉ Diagrama
            </button>
            <button
              className={autoView === "list" ? "seg active" : "seg"}
              onClick={() => setAutoView("list")}
              type="button"
            >
              ☰ Estados y tabla
            </button>
          </div>
          {autoView === "graph" ? (
            <AutomatonGraph
              states={result.states}
              transitions={result.transitions}
            />
          ) : (
            <>
              <StatesViewer states={result.states} />
              <AutomatonViewer transitions={result.transitions} />
            </>
          )}
        </>
      )}

      {active === "steps" && (
        <>
          <div className="segmented">
            <button
              className={stepsView === "anim" ? "seg active" : "seg"}
              onClick={() => setStepsView("anim")}
              type="button"
            >
              ▶ Animación
            </button>
            <button
              className={stepsView === "table" ? "seg active" : "seg"}
              onClick={() => setStepsView("table")}
              type="button"
            >
              ☰ Tabla completa
            </button>
          </div>
          {stepsView === "anim" ? (
            <StepsPlayer steps={result.steps} />
          ) : (
            <StepsTable steps={result.steps} />
          )}
        </>
      )}

      {active === "explanation" && (
        <ExplanationPanel explanation={result.explanation} />
      )}
    </>
  );
}
