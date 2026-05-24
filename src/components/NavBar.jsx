import { useEffect, useState } from "react";
import NavegacionPildora from "./PillNav/PillNav";
import { supabase } from "../supabase/client";
import { mostrarAlertaApp } from "../utils/appAlert";

const NAV_ITEMS = [
  { label: "Reserva", href: "/#reserva", ariaLabel: "Ir a reservas" },
  { label: "Inicio", href: "/#hero", ariaLabel: "Ir al inicio", variant: "accent" },
  { label: "Galeria", href: "/galeria", ariaLabel: "Ir a la galeria", variant: "accent" },
  {
    label: "Como llegar",
    href: "https://maps.app.goo.gl/5abzXP6wxSDkLpgN7",
    ariaLabel: "Abrir ubicacion en Google Maps",
    target: "_blank",
    rel: "noreferrer",
  },
  { label: "Llamar", href: "tel:+34600000000", ariaLabel: "Llamar por telefono" },
  {
    label: "WhatsApp",
    target: "_blank",
    href: "https://wa.me/34680797807",
    ariaLabel: "Abrir WhatsApp",
  },
];

const DASHBOARD_NAV_ITEMS = [
  { label: "Resumen", href: "/dashboard/resumen", ariaLabel: "Ir al resumen del dashboard" },
  { label: "Reservas", href: "/dashboard/reservas", ariaLabel: "Ir a reservas" },
  { label: "Galeria", href: "/dashboard/galeria", ariaLabel: "Ir a la galeria" },
  {
    label: "Configuracion",
    ariaLabel: "Abrir configuracion del dashboard",
    children: [
      { label: "Temporadas y precios", href: "/dashboard/configuracion#temporadas-precios", ariaLabel: "Ir a temporadas y precios" },
      { label: "Servicios extra", href: "/dashboard/configuracion#servicios-extra", ariaLabel: "Ir a servicios extra" },
      { label: "Gestion de usuarios", href: "/dashboard/configuracion#gestion-usuarios", ariaLabel: "Ir a gestion de usuarios" },
    ],
  },
];

function obtenerHrefActivo() {
  if (typeof window === "undefined") return "";
  if (window.location.pathname === "/login") return "/login";
  if (window.location.pathname === "/dashboard") {
    return "/dashboard/resumen";
  }
  if (window.location.pathname.startsWith("/dashboard")) {
    return `${window.location.pathname}${window.location.hash || ""}`;
  }
  return window.location.pathname === "/galeria" ? "/galeria" : `/${window.location.hash}`;
}

function BarraNavegacion() {
  const [activeHref, setActiveHref] = useState(obtenerHrefActivo);
  const [sessionUser, setSessionUser] = useState(null);
  const [userRole, setUserRole] = useState("cliente");
  const isDashboard = typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard");
  const navItems = isDashboard ? DASHBOARD_NAV_ITEMS : NAV_ITEMS;

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
      const currentUser = user;

      setSessionUser(currentUser);

      if (!currentUser) {
        setUserRole("cliente");
        return;
      }

      if (!supabase) {
        setUserRole(currentUser.user_metadata?.rol || "cliente");
        return;
      }

      const { data: perfilPorId } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (perfilPorId?.rol) {
        setUserRole(perfilPorId.rol);
        return;
      }

      if (currentUser.email) {
        const { data: perfilPorEmail } = await supabase
          .from("usuarios")
          .select("rol")
          .eq("email", currentUser.email)
          .maybeSingle();

        setUserRole(perfilPorEmail?.rol || "cliente");
        return;
      }

      setUserRole("cliente");
    }

    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        cargarPerfil(data.user);
      });
    } else {
      cargarPerfil(null);
    }

    const authListener = supabase
      ? supabase.auth.onAuthStateChange((_event, session) => {
          cargarPerfil(session?.user ?? null);
        })
      : null;

    return () => {
      authListener?.data.subscription.unsubscribe();
    };
  }, []);

  async function manejarCierreSesion() {
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
        logo="/logo-lagalana.png"
        logoAlt="Casa Rural La Galana"
        logoHref={isDashboard ? "/dashboard/resumen" : "/#hero"}
        items={navItems}
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
        mode={isDashboard ? "dashboard" : "site"}
        className="pill-nav--site"
      />
    </header>
  );
}

export default BarraNavegacion;
