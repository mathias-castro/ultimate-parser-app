interface Props {
  productions: string[];
}

// In the ACTION table a cell like "r3" means "reduce by production 3".
// Production numbering matches the backend: 1..n are the grammar
// productions in order (0 is the augmented S' -> S, shown as "acc").
export default function ProductionLegend({ productions }: Props) {
  if (productions.length === 0) return null;
  return (
    <div className="legend">
      <h4>Leyenda · sN = shift al estado N · rN = reduce por la producción N</h4>
      <ol>
        {productions.map((prod, i) => (
          <li key={i}>
            <strong>r{i + 1}</strong> &nbsp;{prod}
          </li>
        ))}
      </ol>
    </div>
  );
}
