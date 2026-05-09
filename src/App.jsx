import { useEffect, useState } from "react";
import Inicio from "./pages/Home";
import PaginaGaleria from "./pages/GalleryPage";
import PaginaLogin from "./pages/LoginPage";
import PaginaResumenDashboard from "./pages/dashboard/ResumenPage";
import PaginaReservasDashboard from "./pages/dashboard/ReservasPage";
import PaginaGaleriaDashboard from "./pages/dashboard/GaleriaPage";
import PaginaConfiguracionDashboard from "./pages/dashboard/ConfiguracionPage";

function Aplicacion() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const manejarCambioRuta = () => setPathname(window.location.pathname);

    window.addEventListener("popstate", manejarCambioRuta);
    window.addEventListener("app:navigate", manejarCambioRuta);

    return () => {
      window.removeEventListener("popstate", manejarCambioRuta);
      window.removeEventListener("app:navigate", manejarCambioRuta);
    };
  }, []);

  if (pathname === "/galeria") return <PaginaGaleria />;
  if (pathname === "/login") return <PaginaLogin />;
  if (pathname === "/dashboard" || pathname === "/dashboard/resumen") return <PaginaResumenDashboard />;
  if (pathname === "/dashboard/reservas") return <PaginaReservasDashboard />;
  if (pathname === "/dashboard/galeria") return <PaginaGaleriaDashboard />;
  if (pathname === "/dashboard/configuracion") return <PaginaConfiguracionDashboard />;

  return <Inicio />;
}

export default Aplicacion;
