import { useEffect, useState } from "react";
import { getExamples } from "./api/parserApi";
import Header from "./components/layout/Header";
import MainLayout from "./components/layout/MainLayout";
import AlgorithmSelector from "./components/grammar/AlgorithmSelector";
import ExampleSelector from "./components/grammar/ExampleSelector";
import GrammarEditor from "./components/grammar/GrammarEditor";
import ResultsPanel from "./components/results/ResultsPanel";
import Card from "./components/ui/Card";
import { useParser } from "./hooks/useParser";
import type { Algorithm, Example } from "./types/parser";

const EXPRESSION_GRAMMAR =
  "E -> T E'\n" +
  "E' -> + T E' | epsilon\n" +
  "T -> F T'\n" +
  "T' -> * F T' | epsilon\n" +
  "F -> ( E ) | id";

export default function App() {
  const [grammarText, setGrammarText] = useState(EXPRESSION_GRAMMAR);
  const [inputString, setInputString] = useState("id + id * id");
  const [algorithm, setAlgorithm] = useState<Algorithm>("LL1");
  const [examples, setExamples] = useState<Example[]>([]);

  const { loading, error, result, analyze, clearResult } = useParser();

  useEffect(() => {
    getExamples()
      .then(setExamples)
      .catch(() => setExamples([]));
  }, []);

  const handleAnalyze = async () => {
    await analyze({
      grammar_text: grammarText,
      input_string: inputString,
      algorithm,
    });
  };

  const handleClear = () => {
    setGrammarText("");
    setInputString("");
    clearResult();
  };

  const handleExample = (ex: Example) => {
    setGrammarText(ex.grammar_text);
    setInputString(ex.input_string);
    setAlgorithm(ex.recommended_algorithm);
  };

  return (
    <>
      <Header />
      <MainLayout
        left={
          <>
            <GrammarEditor
              grammarText={grammarText}
              inputString={inputString}
              loading={loading}
              onGrammarChange={setGrammarText}
              onInputChange={setInputString}
              onAnalyze={handleAnalyze}
              onClear={handleClear}
            />
            <Card icon="⚙" title="Configuración">
              <AlgorithmSelector value={algorithm} onChange={setAlgorithm} />
              <ExampleSelector examples={examples} onSelect={handleExample} />
            </Card>
          </>
        }
        right={
          <>
            {error && (
              <div className="alert alert-error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {!error && !result && (
              <div className="card">
                <div className="empty-state">
                  <h3>Sin resultados</h3>
                  <p>
                    Define una gramática y una cadena, elige un método y
                    presiona Analizar.
                  </p>
                </div>
              </div>
            )}
            {result && <ResultsPanel result={result} />}
          </>
        }
      />
      <footer className="app-footer">
        The Ultimate Parser App · Compiladores CS3402
      </footer>
    </>
  );
}
