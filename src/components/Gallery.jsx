import { useEffect, useMemo, useState } from "react";
import CarruselTresD from "./ThreeDCarousel";
import { obtenerSeccionesGaleria } from "../services/galleryService";

const GALLERY_PAGE_PATH = "/galeria";

function crearItemsCarrusel(sections) {
  const images = sections.flatMap((section) =>
    section.images.map((image) => ({
      image,
      section,
    }))
  );

  return images.slice(0, 4).map(({ image, section }, index) => ({
    id: image.id || image.src || index,
    title: image.title || section.title,
    brand: "Casa Rural La Galana",
    description: section.intro || `Imagenes de ${section.title.toLowerCase()} de la casa rural.`,
    tags: [section.title, "Galeria"],
    imageUrl: image.src,
    link: GALLERY_PAGE_PATH,
  }));
}

function Galeria() {
  const [sections, setSections] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const cargarGaleria = () => {
      obtenerSeccionesGaleria().then((nextSections) => {
        if (isMounted) setSections(nextSections);
      });
    };

    cargarGaleria();
    window.addEventListener("focus", cargarGaleria);
    window.addEventListener("gallery:changed", cargarGaleria);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", cargarGaleria);
      window.removeEventListener("gallery:changed", cargarGaleria);
    };
  }, []);

  const carouselItems = useMemo(
    () => (sections === null ? [] : crearItemsCarrusel(sections)),
    [sections]
  );

  return (
    <section
      className="scroll-mt-24 bg-white px-6 py-16 text-center sm:px-10 lg:px-0 lg:py-14"
      id="gallery"
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display text-4xl text-copy">Galeria</h2>
        <p className="mt-3 text-base text-muted">
          Una primera mirada a la casa. Entra en la galeria completa para ver todas las imagenes.
        </p>
      </div>

      {sections === null ? (
        <p className="mt-10 text-sm font-semibold text-muted">Cargando galeria...</p>
      ) : carouselItems.length > 0 ? (
        <CarruselTresD
          items={carouselItems}
          autoRotate
          rotateInterval={4500}
          cardHeight={480}
          linkLabel="Ver galeria"
        />
      ) : (
        <p className="mt-10 text-sm font-semibold text-muted">No hay imagenes disponibles en Supabase.</p>
      )}
    </section>
  );
}

export default Galeria;
