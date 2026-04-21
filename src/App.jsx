import { useEffect, useState } from "react";
import Home from "./pages/Home";
import GalleryPage from "./pages/GalleryPage";

function App() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handleRouteChange = () => setPathname(window.location.pathname);

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("app:navigate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("app:navigate", handleRouteChange);
    };
  }, []);

  return pathname === "/galeria" ? <GalleryPage /> : <Home />;
}

export default App;

