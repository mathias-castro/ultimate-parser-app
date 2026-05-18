import type { Example } from "../../types/parser";

interface Props {
  examples: Example[];
  onSelect: (example: Example) => void;
}

export default function ExampleSelector({ examples, onSelect }: Props) {
  if (examples.length === 0) {
    return <p className="muted">No se pudieron cargar ejemplos del backend.</p>;
  }

  return (
    <div className="field">
      <label htmlFor="example">Ejemplos precargados</label>
      <select
        id="example"
        defaultValue=""
        onChange={(e) => {
          const found = examples.find((ex) => ex.name === e.target.value);
          if (found) onSelect(found);
        }}
      >
        <option value="" disabled>
          Selecciona un ejemplo...
        </option>
        {examples.map((ex) => (
          <option key={ex.name} value={ex.name}>
            {ex.name}
          </option>
        ))}
      </select>
    </div>
  );
}
