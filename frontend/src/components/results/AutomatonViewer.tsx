import Card from "../ui/Card";
import type { Transition } from "../../types/parser";

interface Props {
  transitions: Transition[];
}

export default function AutomatonViewer({ transitions }: Props) {
  if (transitions.length === 0) return null;

  return (
    <Card
      icon="→"
      title="Transiciones del autómata"
      subtitle={`${transitions.length} aristas`}
    >
      <p className="section-note">
        Cada fila es una arista <code>GOTO</code>/<code>shift</code> entre
        estados: desde <strong>Origen</strong>, al leer el{" "}
        <strong>símbolo</strong>, se pasa al estado <strong>Destino</strong>.
      </p>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Origen</th>
              <th>Símbolo</th>
              <th>Destino</th>
            </tr>
          </thead>
          <tbody>
            {transitions.map((t, i) => (
              <tr key={i}>
                <td>{t.from}</td>
                <td className="cell-mono">{t.symbol}</td>
                <td>{t.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
