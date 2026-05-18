import type { ReactNode } from "react";

interface Props {
  left: ReactNode;
  right: ReactNode;
}

export default function MainLayout({ left, right }: Props) {
  return (
    <div className="main-layout">
      <section className="input-panel">{left}</section>
      <section className="results-panel">{right}</section>
    </div>
  );
}
