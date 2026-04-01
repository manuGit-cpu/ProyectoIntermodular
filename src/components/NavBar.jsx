import { useEffect, useState } from "react";
import PillNav from "./PillNav/PillNav";
import "../css/App.css";

const NAV_ITEMS = [
  { label: "Reserva", href: "#reserva", ariaLabel: "Ir a reservas" },
  { label: "Inicio", href: "#hero", ariaLabel: "Ir al inicio", variant: "accent" },
  { label: "Galería", href: "#gallery", ariaLabel: "Ir a la galería", variant: "accent" },
  { label: "Info", href: "#info", ariaLabel: "Ir a información", variant: "accent" },
  { label: "Cómo llegar", href: "#mapa", ariaLabel: "Ir a contacto y mapa" },
  { label: "Llamar", href: "tel:+34600000000", ariaLabel: "Llamar por teléfono" },
  {
    label: "WhatsApp",
    href: "https://wa.me/34600000000",
    ariaLabel: "Abrir WhatsApp",
  },
];

function Navbar() {
  const [activeHref, setActiveHref] = useState(
    typeof window !== "undefined" ? window.location.hash : ""
  );

  useEffect(() => {
    const onHashChange = () => setActiveHref(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <header className="navbar">
      <PillNav
        logo="/vite.svg"
        logoAlt="Casa Rural La Galana"
        logoHref="#hero"
        items={NAV_ITEMS}
        activeHref={activeHref}
        baseColor="#eae6dc"
        pillColor="var(--color-primary)"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#2c2c2c"
        className="pill-nav--site"
      />
    </header>
  );
}

export default Navbar;
