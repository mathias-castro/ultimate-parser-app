import Card from "../ui/Card";
import type { LrState } from "../../types/parser";

interface Props {
  states: LrState[];
}

export default function StatesViewer({ states }: Props) {
  if (states.length === 0) return null;

  return (
    <Card
      icon="◎"
      title="Estados del autómata LR"
      subtitle={`${states.length} estados (colección canónica)`}
    >
      <p className="section-note">
        Cada estado <code>Iₙ</code> es un conjunto de items. El punto{" "}
        <code>·</code> marca hasta dónde se ha reconocido la producción.
      </p>
      <div className="state-grid">
        {states.map((state) => (
          <div className="state-box" key={state.name}>
            <h4>{state.name}</h4>
            <ul>
              {state.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
