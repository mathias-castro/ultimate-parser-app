import Logo from "../ui/Logo";

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-logo">
          <Logo size={20} />
        </div>
        <div>
          <h1>The Ultimate Parser App</h1>
          <p>Análisis sintáctico de gramáticas libres de contexto</p>
        </div>
      </div>
    </header>
  );
}
