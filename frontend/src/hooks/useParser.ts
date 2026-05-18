import { useCallback, useState } from "react";
import { analyzeGrammar } from "../api/parserApi";
import type { AnalyzeRequest, AnalyzeResponse } from "../types/parser";

interface UseParserResult {
  loading: boolean;
  error: string | null;
  result: AnalyzeResponse | null;
  analyze: (request: AnalyzeRequest) => Promise<AnalyzeResponse | null>;
  clearResult: () => void;
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

  return { loading, error, result, analyze, clearResult };
}
