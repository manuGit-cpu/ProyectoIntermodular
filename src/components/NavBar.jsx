import { useEffect, useState } from "react";
import NavegacionPildora from "./PillNav/PillNav";
import { supabase } from "../supabase/client";
import { mostrarAlertaApp } from "../utils/appAlert";
import { obtenerUsuarioDemo, cerrarSesionUsuarioDemo } from "../utils/demoAuth";

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

function obtenerHrefActivo() {
  if (typeof window === "undefined") return "";
  if (window.location.pathname === "/login") return "/login";
  return window.location.pathname === "/galeria" ? "/galeria" : `/${window.location.hash}`;
}

function BarraNavegacion() {
  const [activeHref, setActiveHref] = useState(obtenerHrefActivo);
  const [sessionUser, setSessionUser] = useState(null);
  const [userRole, setUserRole] = useState("cliente");

  useEffect(() => {
    const manejarCambioRuta = () => setActiveHref(obtenerHrefActivo());

    window.addEventListener("hashchange", manejarCambioRuta);
    window.addEventListener("popstate", manejarCambioRuta);
    window.addEventListener("app:navigate", manejarCambioRuta);

    return () => {
      window.removeEventListener("hashchange", manejarCambioRuta);
      window.removeEventListener("popstate", manejarCambioRuta);
      window.removeEventListener("app:navigate", manejarCambioRuta);
    };
  }, []);

  useEffect(() => {
    async function cargarPerfil(user) {
      const demoUser = obtenerUsuarioDemo();
      const currentUser = user || demoUser;

      setSessionUser(currentUser);

      if (!currentUser) {
        setUserRole("cliente");
        return;
      }

      if (!supabase || demoUser?.id === currentUser.id) {
        setUserRole(currentUser.user_metadata?.rol || "cliente");
        return;
      }

      const { data } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", currentUser.id)
        .maybeSingle();

      setUserRole(data?.rol || currentUser.user_metadata?.rol || "cliente");
    }

    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        cargarPerfil(data.user);
      });
    } else {
      cargarPerfil(null);
    }

    const manejarCambioAutenticacionDemo = () => cargarPerfil(null);
    window.addEventListener("app:demo-auth", manejarCambioAutenticacionDemo);

    const authListener = supabase
      ? supabase.auth.onAuthStateChange((_event, session) => {
          cargarPerfil(session?.user ?? null);
        })
      : null;

    return () => {
      window.removeEventListener("app:demo-auth", manejarCambioAutenticacionDemo);
      authListener?.data.subscription.unsubscribe();
    };
  }, []);

  async function manejarCierreSesion() {
    cerrarSesionUsuarioDemo();

    if (supabase) {
      await supabase.auth.signOut();
    }

    setSessionUser(null);
    setUserRole("cliente");

    mostrarAlertaApp({
      title: "Sesion cerrada",
      message: "Has salido de tu cuenta.",
      variant: "success",
    });

    window.history.pushState({}, "", "/#hero");
    window.dispatchEvent(new Event("app:navigate"));
  }

  return (
    <header className="pointer-events-none fixed top-0 left-0 z-50 flex w-full items-start justify-center bg-linear-to-b from-surface/95 via-surface/85 to-transparent px-4 pt-3 pb-4 md:px-6">
      <NavegacionPildora
        logo="/vite.svg"
        logoAlt="Casa Rural La Galana"
        logoHref="/#hero"
        items={NAV_ITEMS}
        activeHref={activeHref}
        userHref="/login"
        userActive={activeHref === "/login"}
        user={sessionUser}
        userRole={userRole}
        onLogout={manejarCierreSesion}
        baseColor="#eae6dc"
        pillColor="var(--color-brand)"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#2c2c2c"
        className="pill-nav--site"
      />
    </header>
  );
}

export default BarraNavegacion;
