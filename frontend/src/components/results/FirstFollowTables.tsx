import Card from "../ui/Card";

interface Props {
  first: Record<string, string[]>;
  follow: Record<string, string[]>;
}

function SetTable({
  title,
  sets,
}: {
  title: string;
  sets: Record<string, string[]>;
}) {
  const entries = Object.entries(sets);
  if (entries.length === 0) return null;
  return (
    <div style={{ marginBottom: "1rem" }}>
      <h4 style={{ marginBottom: "0.5rem", color: "var(--text-soft)" }}>
        {title}
      </h4>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No terminal</th>
              <th>Conjunto</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([nt, values]) => (
              <tr key={nt}>
                <td>{nt}</td>
                <td className="cell-mono">{`{ ${values.join(", ")} }`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function FirstFollowTables({ first, follow }: Props) {
  if (Object.keys(first).length === 0) return null;
  return (
    <Card icon="∑" title="Conjuntos FIRST y FOLLOW">
      <p className="section-note">
        <strong>FIRST(A)</strong> = terminales con los que puede empezar una
        derivación de A. <strong>FOLLOW(A)</strong> = terminales que pueden
        aparecer inmediatamente después de A. Son la base de LL(1) y SLR(1).
      </p>
      <SetTable title="FIRST" sets={first} />
      <SetTable title="FOLLOW" sets={follow} />
    </Card>
  );
}
