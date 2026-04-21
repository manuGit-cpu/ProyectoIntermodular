import { useEffect, useState } from "react";
import PillNav from "./PillNav/PillNav";

const NAV_ITEMS = [
  { label: "Reserva", href: "/#reserva", ariaLabel: "Ir a reservas" },
  { label: "Inicio", href: "/#hero", ariaLabel: "Ir al inicio", variant: "accent" },
  { label: "Galería", href: "/galeria", ariaLabel: "Ir a la galería", variant: "accent" },
  { label: "Info", href: "/#info", ariaLabel: "Ir a información", variant: "accent" },
  {
    label: "Como llegar",
    href: "https://maps.app.goo.gl/5abzXP6wxSDkLpgN7",
    ariaLabel: "Abrir ubicacion en Google Maps",
    target: "_blank",
    rel: "noreferrer",
  },
  { label: "Llamar", href: "tel:+34600000000", ariaLabel: "Llamar por teléfono" },
  {
    label: "WhatsApp",
    target: "_blank",
    href: "https://wa.me/34680797807",
    ariaLabel: "Abrir WhatsApp",
  },
];

function getActiveHref() {
  if (typeof window === "undefined") return "";
  return window.location.pathname === "/galeria" ? "/galeria" : `/${window.location.hash}`;
}

function Navbar() {
  const [activeHref, setActiveHref] = useState(getActiveHref);

  useEffect(() => {
    const onHashChange = () => setActiveHref(getActiveHref());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <header className="pointer-events-none fixed top-0 left-0 z-50 flex w-full items-start justify-center bg-linear-to-b from-surface/95 via-surface/85 to-transparent px-4 pt-3 pb-4 md:px-6">
      <PillNav
        logo="/vite.svg"
        logoAlt="Casa Rural La Galana"
        logoHref="/#hero"
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

