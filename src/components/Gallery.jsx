import { useEffect, useMemo, useState } from "react";
import CarruselTresD from "./ThreeDCarousel";
import { FEATURED_IMAGES } from "../data/laGalanaImages";
import { fetchGallerySections } from "../services/galleryService";

const GALLERY_PAGE_PATH = "/galeria";

const GALLERY_ITEMS = [
  {
    id: 1,
    title: "Entorno y vistas",
    brand: "Casa Rural La Galana",
    description: "Espacios amplios rodeados de naturaleza, ideal para desconectar.",
    tags: ["Naturaleza", "Descanso"],
    imageUrl: FEATURED_IMAGES.exterior,
    link: GALLERY_PAGE_PATH,
  },
  {
    id: 2,
    title: "Interiores acogedores",
    brand: "Casa Rural La Galana",
    description: "Salon y estancias pensadas para grupos y familias.",
    tags: ["Interior", "Confort"],
    imageUrl: FEATURED_IMAGES.livingRoom,
    link: GALLERY_PAGE_PATH,
  },
  {
    id: 3,
    title: "Fachada y acceso",
    brand: "Casa Rural La Galana",
    description: "Entrada y zona exterior de la vivienda rural.",
    tags: ["Exterior", "Acceso"],
    imageUrl: FEATURED_IMAGES.hero,
    link: GALLERY_PAGE_PATH,
  },
  {
    id: 4,
    title: "Habitaciones",
    brand: "Casa Rural La Galana",
    description: "Dormitorios cuidados para una estancia tranquila y comoda.",
    tags: ["Dormitorio", "Descanso"],
    imageUrl: FEATURED_IMAGES.bedroom,
    link: GALLERY_PAGE_PATH,
  },
];

function crearItemsCarrusel(sections) {
  const images = sections.flatMap((section) =>
    section.images.map((image) => ({
      image,
      section,
    }))
  );

  if (!images.length) return GALLERY_ITEMS;

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
      fetchGallerySections().then((nextSections) => {
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

  const carouselItems = useMemo(() => (sections === null ? GALLERY_ITEMS : crearItemsCarrusel(sections)), [sections]);

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

      <CarruselTresD
        items={carouselItems}
        autoRotate
        rotateInterval={4500}
        cardHeight={480}
        linkLabel="Ver galeria"
      />
    </section>
  );
}

export default Galeria;
