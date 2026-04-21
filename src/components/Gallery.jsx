import ThreeDCarousel from "./ThreeDCarousel";

const GALLERY_PAGE_PATH = "/galeria";

const GALLERY_ITEMS = [
  {
    id: 1,
    title: "Entorno y vistas",
    brand: "Casa Rural La Galana",
    description: "Espacios amplios rodeados de naturaleza, ideal para desconectar.",
    tags: ["Naturaleza", "Descanso"],
    imageUrl: "https://casaruralgalana.com/wp-content/uploads/2014/03/T4Q0979.jpg",
    link: GALLERY_PAGE_PATH,
  },
  {
    id: 2,
    title: "Interiores acogedores",
    brand: "Casa Rural La Galana",
    description: "Salón y estancias pensadas para grupos y familias.",
    tags: ["Interior", "Confort"],
    imageUrl: "https://casaruralgalana.com/wp-content/uploads/2014/03/T4Q0996.jpg",
    link: GALLERY_PAGE_PATH,
  },
  {
    id: 3,
    title: "Fachada y acceso",
    brand: "Casa Rural La Galana",
    description: "Entrada y zona exterior de la vivienda rural.",
    tags: ["Exterior", "Acceso"],
    imageUrl: "https://casaruralgalana.com/wp-content/uploads/2014/06/fachada2.jpg",
    link: GALLERY_PAGE_PATH,
  },
  {
    id: 4,
    title: "Momentos de ocio",
    brand: "Casa Rural La Galana",
    description: "Planes tranquilos para disfrutar con calma en familia o con amigos.",
    tags: ["Ocio", "Familia"],
    imageUrl: "https://casaruralgalana.com/wp-content/uploads/2014/03/T4Q0979.jpg",
    link: GALLERY_PAGE_PATH,
  },
];

function Gallery() {
  return (
    <section
      className="scroll-mt-24 bg-white px-6 py-16 text-center sm:px-10 lg:px-0 lg:py-14"
      id="gallery"
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display text-4xl text-copy">Galería</h2>
        <p className="mt-3 text-base text-muted">
          Una primera mirada a la casa. Entra en la galería completa para ver todas las imágenes.
        </p>
      </div>

      <ThreeDCarousel
        items={GALLERY_ITEMS}
        autoRotate
        rotateInterval={4500}
        cardHeight={480}
        linkLabel="Ver galería"
      />
    </section>
  );
}

export default Gallery;

