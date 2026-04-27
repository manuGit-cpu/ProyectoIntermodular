import { useEffect, useState } from "react";
import Home from "./pages/Home";
import GalleryPage from "./pages/GalleryPage";
import LoginPage from "./pages/LoginPage";

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

  if (pathname === "/galeria") return <GalleryPage />;
  if (pathname === "/login") return <LoginPage />;

  return <Home />;
}

export default App;
