import { useCallback, useState } from "react";
import { analyzeGrammar } from "../api/parserApi";
import type { AnalyzeRequest, AnalyzeResponse } from "../types/parser";
import { addEntry } from "../services/historyService";

const uuidv4 = () => {
  try {
    // use native crypto if available
    // @ts-ignore
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
      // @ts-ignore
      return (crypto as any).randomUUID();
    }
  } catch (e) {
    // ignore
  }
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
};

interface UseParserResult {
  loading: boolean;
  error: string | null;
  result: AnalyzeResponse | null;
  analyze: (request: AnalyzeRequest) => Promise<AnalyzeResponse | null>;
  clearResult: () => void;
  setExternalResult?: (r: AnalyzeResponse) => void;
}

export function useParser(): UseParserResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const analyze = useCallback(
    async (request: AnalyzeRequest): Promise<AnalyzeResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await analyzeGrammar(request);
        setResult(response);
        try {
          const entry = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            algorithm: request.algorithm,
            input_string: request.input_string,
            grammar_text: request.grammar_text,
            accepted: response.accepted,
            message: response.message,
            ast: response.ast ?? null,
            fullResult: response,
          } as any;
          addEntry(entry);
        } catch {
          // ignore history errors
        }
        return response;
      } catch (err) {
        const message =
          err instanceof Error
            ? `No se pudo contactar al backend (${err.message}). ` +
              "¿Está corriendo en http://localhost:8000?"
            : "Error desconocido al analizar.";
        setError(message);
        setResult(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  // allow external components to set the current result (e.g., load from history)
  const setExternalResult = useCallback((r: AnalyzeResponse) => {
    setResult(r);
  }, []);

  return { loading, error, result, analyze, clearResult, setExternalResult };
}
