import type { HistoryEntry } from "../types/parser";

const STORAGE_KEY = "parser_history_v1";

function loadAll(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveAll(list: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    try {
      window.dispatchEvent(new CustomEvent("parser_history_updated"));
    } catch {
      // ignore in non-browser env
    }
  } catch {
    // ignore
  }
}

export function listHistory(): HistoryEntry[] {
  return loadAll();
}

export function addEntry(entry: HistoryEntry) {
  const all = loadAll();
  all.unshift(entry);
  // keep a reasonable cap
  if (all.length > 100) all.splice(100);
  saveAll(all);
}

export function removeEntry(id: string) {
  const all = loadAll().filter((e) => e.id !== id);
  saveAll(all);
}

export function clearHistory() {
  saveAll([]);
}

export default {
  listHistory,
  addEntry,
  removeEntry,
  clearHistory,
};
