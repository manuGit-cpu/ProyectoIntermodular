import { useEffect, useState } from "react";
import Inicio from "./pages/Home";
import PaginaGaleria from "./pages/GalleryPage";
import PaginaLogin from "./pages/LoginPage";

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

  return <Inicio />;
}

export default Aplicacion;
