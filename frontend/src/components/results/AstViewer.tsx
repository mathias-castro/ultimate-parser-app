import Card from "../ui/Card";
import type { AstNode } from "../../types/parser";
import AstGraph from "./AstGraph";

interface Props {
  ast: AstNode;
}

export default function AstViewer({ ast }: Props) {
  return (
    <Card
      icon="⟐"
      title="Árbol sintáctico"
      subtitle="Representación jerárquica del resultado del análisis"
    >
      <p className="section-note">
        El árbol se construye desde las producciones aplicadas por el parser y
        muestra cómo se organiza la derivación aceptada.
      </p>
      <div className="ast-wrapper">
        <AstGraph ast={ast} />
      </div>
    </Card>
  );
}