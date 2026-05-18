import Card from "../ui/Card";

interface Props {
  explanation: string;
}

export default function ExplanationPanel({ explanation }: Props) {
  if (!explanation) return null;
  return (
    <Card icon="›" title="Explicación">
      <p className="explanation">{explanation}</p>
    </Card>
  );
}
