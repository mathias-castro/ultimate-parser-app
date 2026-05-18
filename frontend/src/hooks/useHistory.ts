import { useCallback, useEffect, useState } from "react";
import type { HistoryEntry } from "../types/parser";
import * as historyService from "../services/historyService";

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => historyService.listHistory());

  useEffect(() => {
    // initialise and subscribe to external history updates
    setEntries(historyService.listHistory());
    const handler = () => setEntries(historyService.listHistory());
    window.addEventListener("parser_history_updated", handler);
    return () => window.removeEventListener("parser_history_updated", handler);
  }, []);

  const refresh = useCallback(() => setEntries(historyService.listHistory()), []);

  const add = useCallback((entry: HistoryEntry) => {
    historyService.addEntry(entry);
    refresh();
  }, [refresh]);

  const remove = useCallback((id: string) => {
    historyService.removeEntry(id);
    refresh();
  }, [refresh]);

  const clear = useCallback(() => {
    historyService.clearHistory();
    refresh();
  }, [refresh]);

  return { entries, add, remove, clear, refresh };
}
