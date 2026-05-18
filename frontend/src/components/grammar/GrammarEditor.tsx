import Card from "../ui/Card";

interface Props {
  grammarText: string;
  inputString: string;
  loading: boolean;
  onGrammarChange: (value: string) => void;
  onInputChange: (value: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
}

export default function GrammarEditor({
  grammarText,
  inputString,
  loading,
  onGrammarChange,
  onInputChange,
  onAnalyze,
  onClear,
}: Props) {
  return (
    <Card icon="✎" title="Entrada" subtitle="Define la gramática y la cadena">
      <div className="field">
        <label htmlFor="grammar">Gramática</label>
        <textarea
          id="grammar"
          value={grammarText}
          onChange={(e) => onGrammarChange(e.target.value)}
          placeholder={"E -> T E'\nE' -> + T E' | epsilon"}
          spellCheck={false}
        />
        <p className="hint">
          Una producción por línea · <code>|</code> alternativas ·{" "}
          <code>epsilon</code> = ε
        </p>
      </div>

      <div className="field">
        <label htmlFor="input">Cadena de entrada</label>
        <input
          id="input"
          type="text"
          value={inputString}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="id + id * id"
          spellCheck={false}
        />
        <p className="hint">Con o sin espacios entre tokens.</p>
      </div>

      <div className="button-row">
        <button className="btn" type="button" onClick={onClear}>
          Limpiar
        </button>
      </div>
      <div className="button-row" style={{ marginTop: "0.5rem" }}>
        <button
          className="btn btn-primary"
          type="button"
          onClick={onAnalyze}
          disabled={loading}
        >
          {loading ? "Analizando…" : "▶  Analizar"}
        </button>
      </div>
    </Card>
  );
}
