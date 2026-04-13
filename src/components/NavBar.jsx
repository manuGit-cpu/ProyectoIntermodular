import { useEffect, useState } from "react";
import PillNav from "./PillNav/PillNav";

const NAV_ITEMS = [
  { label: "Reserva", href: "#reserva", ariaLabel: "Ir a reservas" },
  { label: "Inicio", href: "#hero", ariaLabel: "Ir al inicio", variant: "accent" },
  { label: "Galeri­a", href: "#gallery", ariaLabel: "Ir a la galer­ia", variant: "accent" },
  { label: "Info", href: "#info", ariaLabel: "Ir a informaciÃ³n", variant: "accent" },
  { label: "Como llegar", href: "#mapa", ariaLabel: "Ir a contacto y mapa" },
  { label: "Llamar", href: "tel:+34600000000", ariaLabel: "Llamar por telÃ©fono" },
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
    <header className="pointer-events-none fixed top-0 left-0 z-50 flex w-full items-start justify-center bg-linear-to-b from-surface/95 via-surface/85 to-transparent px-4 pt-3 pb-4 md:px-6">
      <PillNav
        logo="/vite.svg"
        logoAlt="Casa Rural La Galana"
        logoHref="#hero"
        items={NAV_ITEMS}
        activeHref={activeHref}
        baseColor="#eae6dc"
        pillColor="var(--color-brand)"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#2c2c2c"
        className="pill-nav--site"
      />
    </header>
  );
}

export default Navbar;
