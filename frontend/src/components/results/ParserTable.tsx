import Card from "../ui/Card";
import type { GenericTable } from "../../types/parser";

interface Props {
  title: string;
  icon: string;
  note?: string;
  table: GenericTable;
  conflictCells?: Map<string, string>;
}

export default function ParserTable({ title, icon, note, table, conflictCells }: Props) {
  if (!table || table.columns.length === 0 || table.rows.length === 0) {
    return null;
  }

  const rowKey = table.columns[0];

  return (
    <Card icon={icon} title={title}>
      {note && <p className="section-note">{note}</p>}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {table.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i}>
                {table.columns.map((col) => {
                  const value = row[col] ?? "";
                  const conflictNew = conflictCells?.get(`${row[rowKey]}|${col}`);
                  const isConflict = conflictNew !== undefined;
                  return (
                    <td
                      key={col}
                      className={
                        isConflict ? "cell-conflict" : value ? "cell-mono" : "cell-empty"
                      }
                    >
                      {isConflict ? (
                        <span className="conflict-pair">
                          <span>{value}</span>
                          <span>{conflictNew}</span>
                        </span>
                      ) : (
                        value || "·"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
