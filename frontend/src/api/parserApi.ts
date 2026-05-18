import type { AnalyzeRequest, AnalyzeResponse, Example } from "../types/parser";

// Configurable for cloud deployment: set VITE_API_BASE_URL at build time.
// Falls back to localhost for local Docker / dev.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`El servidor respondió con estado ${response.status}.`);
  }
  return (await response.json()) as T;
}

export async function analyzeGrammar(
  request: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handle<AnalyzeResponse>(response);
}

export async function getExamples(): Promise<Example[]> {
  const response = await fetch(`${API_BASE_URL}/examples`);
  return handle<Example[]>(response);
}
