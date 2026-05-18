import type { ReactNode } from "react";

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function Card({ icon, title, subtitle, children }: Props) {
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__icon">{icon}</span>
        <div>
          <h2 className="card__title">{title}</h2>
          {subtitle && <div className="card__sub">{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
