// Types describing the backend API contract.

export type Algorithm =
  | "RECURSIVE_DESCENT"
  | "LL1"
  | "LR0"
  | "SLR1"
  | "LR1"
  | "LALR1";

export interface AnalyzeRequest {
  grammar_text: string;
  input_string: string;
  algorithm: Algorithm;
}

export interface GenericTable {
  columns: string[];
  rows: Record<string, string>[];
}

export interface GrammarAnalysis {
  left_recursion: string[];
  common_prefixes: string[];
  nullable: string[];
  notes: string[];
}

export interface GrammarInfo {
  start_symbol?: string;
  non_terminals?: string[];
  terminals?: string[];
  productions?: string[];
  analysis?: GrammarAnalysis;
}

export interface ParseStepRow {
  stack: string;
  symbols: string;
  input: string;
  action: string;
}

export interface LrState {
  name: string;
  items: string[];
}

export interface Transition {
  from: string;
  symbol: string;
  to: string;
}

export interface Conflict {
  type: string;
  cell: string;
  existing: string;
  new: string;
}

export interface AnalyzeResponse {
  accepted: boolean;
  algorithm: string;
  message: string;
  grammar: GrammarInfo;
  first: Record<string, string[]>;
  follow: Record<string, string[]>;
  ll1_table: GenericTable;
  action_table: GenericTable;
  goto_table: GenericTable;
  states: LrState[];
  transitions: Transition[];
  steps: ParseStepRow[];
  conflicts: Conflict[];
  explanation: string;
}

export interface Example {
  name: string;
  grammar_text: string;
  input_string: string;
  recommended_algorithm: Algorithm;
}
