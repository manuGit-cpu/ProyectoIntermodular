import "../css/App.css";

function Navbar() {
  const scrollTo = (id) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="navbar">
      <button className="nav-btn primary" onClick={() => scrollTo("reserva")}>
        Reserva
      </button>

      <button className="nav-btn secondary" onClick={() => scrollTo("hero")}>
        Inicio
      </button>

      <button className="nav-btn secondary" onClick={() => scrollTo("gallery")}>
        Galería
      </button>

      <button className="nav-btn secondary" onClick={() => scrollTo("info")}>
        Info
      </button>

      <button className="nav-btn primary" onClick={() => scrollTo("mapa")}>
        Cómo llegar
      </button>

      <a className="nav-btn primary" href="tel:+34600000000">
        Llamar
      </a>

      <a
        className="nav-btn primary"
        href="https://wa.me/34600000000"
        target="_blank"
      >
        Whatsapp
      </a>
    </nav>
  );
}

export default Navbar;