import { useEffect, useState } from "react";
import PillNav from "./PillNav/PillNav";
import { supabase } from "../supabase/client";
import { showAppAlert } from "../utils/appAlert";
import { getDemoUser, signOutDemoUser } from "../utils/demoAuth";

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
  if (window.location.pathname === "/login") return "/login";
  return window.location.pathname === "/galeria" ? "/galeria" : `/${window.location.hash}`;
}

function Navbar() {
  const [activeHref, setActiveHref] = useState(getActiveHref);
  const [sessionUser, setSessionUser] = useState(null);
  const [userRole, setUserRole] = useState("cliente");

  useEffect(() => {
    const onRouteChange = () => setActiveHref(getActiveHref());

    window.addEventListener("hashchange", onRouteChange);
    window.addEventListener("popstate", onRouteChange);
    window.addEventListener("app:navigate", onRouteChange);

    return () => {
      window.removeEventListener("hashchange", onRouteChange);
      window.removeEventListener("popstate", onRouteChange);
      window.removeEventListener("app:navigate", onRouteChange);
    };
  }, []);

  useEffect(() => {
    async function loadProfile(user) {
      const demoUser = getDemoUser();
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
        loadProfile(data.user);
      });
    } else {
      loadProfile(null);
    }

    const onDemoAuthChange = () => loadProfile(null);
    window.addEventListener("app:demo-auth", onDemoAuthChange);

    const authListener = supabase
      ? supabase.auth.onAuthStateChange((_event, session) => {
          loadProfile(session?.user ?? null);
        })
      : null;

    return () => {
      window.removeEventListener("app:demo-auth", onDemoAuthChange);
      authListener?.data.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    signOutDemoUser();

    if (supabase) {
      await supabase.auth.signOut();
    }

    setSessionUser(null);
    setUserRole("cliente");

    showAppAlert({
      title: "Sesion cerrada",
      message: "Has salido de tu cuenta.",
      variant: "success",
    });

    window.history.pushState({}, "", "/#hero");
    window.dispatchEvent(new Event("app:navigate"));
  }

  return (
    <header className="pointer-events-none fixed top-0 left-0 z-50 flex w-full items-start justify-center bg-linear-to-b from-surface/95 via-surface/85 to-transparent px-4 pt-3 pb-4 md:px-6">
      <PillNav
        logo="/vite.svg"
        logoAlt="Casa Rural La Galana"
        logoHref="/#hero"
        items={NAV_ITEMS}
        activeHref={activeHref}
        userHref="/login"
        userActive={activeHref === "/login"}
        user={sessionUser}
        userRole={userRole}
        onLogout={handleLogout}
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
