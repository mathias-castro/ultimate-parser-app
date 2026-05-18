import React, { useMemo, useState } from "react";
import { useHistory } from "../../hooks/useHistory";
import type { HistoryEntry } from "../../types/parser";

interface Props {
  onLoad?: (entry: HistoryEntry) => void;
}

const PAGE_SIZE = 8;

export default function HistoryPanel({ onLoad }: Props) {
  const { entries, remove, clear } = useHistory();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => {
      return (
        (e.grammar_text || "").toLowerCase().includes(q) ||
        (e.input_string || "").toLowerCase().includes(q) ||
        (e.algorithm || "").toLowerCase().includes(q) ||
        (e.message || "").toLowerCase().includes(q)
      );
    });
  }, [entries, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function gotoPrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  function gotoNext() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  // open/close only; expand/collapse removed

  return (
    <div className="card">
      <div className="card__head">
        <div className="card__icon">🕘</div>
        <div style={{ flex: 1 }}>
          <h3 className="card__title">Historial</h3>
          <div className="card__sub">Análisis guardados localmente</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn" onClick={() => setOpen((v) => !v)} type="button">{open ? "Cerrar" : "Abrir"}</button>
        </div>
        <div style={{ width: 180 }}>
          <input
            aria-label="Buscar historial"
            placeholder="Buscar gramática, cadena o algoritmo"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: 8 }}
          />
        </div>
      </div>

      {!open ? null : entries.length === 0 ? (
        <div className="empty-state">
          <p>No hay entradas guardadas.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pageItems.map((e) => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, borderRadius: 8, background: "var(--panel-2)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{e.algorithm} · {new Date(e.timestamp).toLocaleString()}</div>
                <div style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>{e.input_string}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn" onClick={() => onLoad && onLoad(e)} type="button">Cargar</button>
                <button className="btn" onClick={() => remove(e.id)} type="button">Borrar</button>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={gotoPrev} disabled={page <= 1} type="button">◀ Prev</button>
              <button className="btn" onClick={gotoNext} disabled={page >= totalPages} type="button">Next ▶</button>
              <div style={{ alignSelf: "center", color: "var(--muted)" }}>
                Página {page} / {totalPages}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={() => { clear(); setPage(1); }} type="button">Borrar todo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
