import ThreeDCarousel from "./ThreeDCarousel";

const GALLERY_ITEMS = [
  {
    id: 1,
    title: "Entorno y vistas",
    brand: "Casa Rural La Galana",
    description: "Espacios amplios rodeados de naturaleza, ideal para desconectar.",
    tags: ["Naturaleza", "Descanso"],
    imageUrl: "https://casaruralgalana.com/wp-content/uploads/2014/03/T4Q0979.jpg",
    link: "#info",
  },
  {
    id: 2,
    title: "Interiores acogedores",
    brand: "Casa Rural La Galana",
    description: "SalÃ³n y estancias pensadas para grupos y familias.",
    tags: ["Interior", "Confort"],
    imageUrl: "https://casaruralgalana.com/wp-content/uploads/2014/03/T4Q0996.jpg",
    link: "#reserva",
  },
  {
    id: 3,
    title: "Fachada y acceso",
    brand: "Casa Rural La Galana",
    description: "Entrada y zona exterior de la vivienda rural.",
    tags: ["Exterior", "Acceso"],
    imageUrl: "https://casaruralgalana.com/wp-content/uploads/2014/06/fachada2.jpg",
    link: "#mapa",
  },
  {
    id: 4,
    title: "Detalle del entorno",
    brand: "Casa Rural La Galana",
    description: "Imagen de prueba reutilizada para el carrusel 3D.",
    tags: ["Prueba", "Galeria"],
    imageUrl: "https://casaruralgalana.com/wp-content/uploads/2014/03/T4Q0979.jpg",
    link: "#gallery",
  },
];

function Gallery() {
  return (
    <section
      className="scroll-mt-24 bg-white px-6 py-16 text-center sm:px-10 lg:px-0 lg:py-14"
      id="gallery"
    >
      <h2 className="font-display text-4xl text-copy">Galer­ia</h2>

      <ThreeDCarousel
        items={GALLERY_ITEMS}
        autoRotate
        rotateInterval={4500}
        cardHeight={480}
        linkLabel="Saber más"
      />
    </section>
  );
}

export default Gallery;
