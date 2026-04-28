import { EXTERIOR_IMAGES, INTERIOR_IMAGES, obtenerImagenLaGalana } from "./laGalanaImages";

const crearImagen = ([filename, title]) => ({
  src: obtenerImagenLaGalana(filename),
  title,
  alt: `${title} en Casa Rural La Galana`,
});

export const GALLERY_SECTIONS = [
  {
    id: "exterior",
    title: "Exterior",
    intro: "Fachada de piedra, patio de entrada y espacios abiertos alrededor de la casa.",
    tone: "accent",
    images: EXTERIOR_IMAGES.map(crearImagen),
  },
  {
    id: "interior",
    title: "Interior",
    intro: "Estancias calidas, habitaciones con encanto y rincones pensados para descansar.",
    tone: "brand",
    images: INTERIOR_IMAGES.map(crearImagen),
  },
];
