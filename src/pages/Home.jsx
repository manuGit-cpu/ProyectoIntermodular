import Portada from "../components/Hero";
import Informacion from "../components/Info";
import Galeria from "../components/Gallery";
import Reserva from "../components/Reserva";
import BarraNavegacion from "../components/NavBar";
import RevelarAlDesplazar from "../components/ScrollReveal";
import PiePagina from "../layouts/Footer";

function Inicio() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-copy">
      <BarraNavegacion />
      <Portada />
      <RevelarAlDesplazar as="div" x={-56}>
        <Informacion />
      </RevelarAlDesplazar>
      <div className="grid w-full grid-cols-1 items-stretch lg:gap-8 lg:px-[clamp(24px,4vw,56px)]">
        <RevelarAlDesplazar as="div" x={56}>
          <Galeria />
        </RevelarAlDesplazar>
        <RevelarAlDesplazar as="div" x={-56}>
          <Reserva />
        </RevelarAlDesplazar>
      </div>
      <PiePagina />
    </div>
  );
}

export default Inicio;
