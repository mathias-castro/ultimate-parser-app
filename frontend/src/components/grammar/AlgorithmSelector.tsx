import type { Algorithm } from "../../types/parser";

interface Props {
  value: Algorithm;
  onChange: (value: Algorithm) => void;
}

const OPTIONS: {
  value: Algorithm;
  label: string;
  family: string;
  description: string;
}[] = [
  {
    value: "RECURSIVE_DESCENT",
    label: "Descenso Recursivo",
    family: "Top-down",
    description:
      "Una función por cada no terminal. Especializado para la gramática educativa de expresiones. Ideal para ver la recursión de forma intuitiva.",
  },
  {
    value: "LL1",
    label: "LL(1)",
    family: "Top-down",
    description:
      "Usa una tabla predictiva construida con FIRST/FOLLOW y una pila. Lee de izquierda a derecha con 1 token de anticipación.",
  },
  {
    value: "LR0",
    label: "LR(0)",
    family: "Bottom-up",
    description:
      "Construye el autómata de items LR(0). Reduce sin mirar el siguiente token, por lo que entra en conflicto con facilidad.",
  },
  {
    value: "SLR1",
    label: "SLR(1)",
    family: "Bottom-up",
    description:
      "Reutiliza el autómata LR(0) pero solo reduce sobre los terminales de FOLLOW. Resuelve muchos conflictos de LR(0).",
  },
  {
    value: "LR1",
    label: "LR(1)",
    family: "Bottom-up",
    description:
      "Items con lookahead [A → α·β, a]. Es el método más potente; genera más estados pero menos conflictos.",
  },
  {
    value: "LALR1",
    label: "LALR(1)",
    family: "Bottom-up",
    description:
      "Parte de LR(1) y fusiona estados con el mismo núcleo LR(0). Combina la potencia de LR(1) con tablas compactas.",
  },
];

export default function AlgorithmSelector({ value, onChange }: Props) {
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <div className="field">
      <label htmlFor="algorithm">Método de análisis</label>
      <select
        id="algorithm"
        value={value}
        onChange={(e) => onChange(e.target.value as Algorithm)}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label} · {opt.family}
          </option>
        ))}
      </select>
      <p className="algo-hint">{current.description}</p>
    </div>
  );
}
