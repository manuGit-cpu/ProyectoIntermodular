const image = (src, title) => ({
  src,
  title,
  alt: `${title} en Casa Rural La Galana`,
});

const interiorPath = "https://casaruralgalana.com/wp-content/uploads/2014/06";
const exteriorPath = "https://casaruralgalana.com/wp-content/uploads/2014/06";
const ocioPath = "https://casaruralgalana.com/wp-content/uploads/2020/11";

export const GALLERY_SECTIONS = [
  {
    id: "interior",
    title: "Interior",
    intro: "Estancias cálidas, habitaciones con encanto y rincones pensados para descansar.",
    tone: "brand",
    images: [
      image(`${interiorPath}/T4Q0930-300x200.jpg`, "Salón principal"),
      image(`${interiorPath}/cocina_balcon-300x200.jpg`, "Cocina con balcón"),
      image(`${interiorPath}/galana4-300x200.jpg`, "Zona común"),
      image(`${interiorPath}/T4Q0913-300x200.jpg`, "Dormitorio rústico"),
      image(`${interiorPath}/T4Q0941-300x200.jpg`, "Detalle interior"),
      image(`${interiorPath}/galana6-300x200.jpg`, "Habitación familiar"),
      image(`${interiorPath}/galana5-300x200.jpg`, "Estancia luminosa"),
      image(`${interiorPath}/T4Q0988-300x200.jpg`, "Rincón de descanso"),
      image(`${interiorPath}/T4Q0979-300x200.jpg`, "Comedor"),
      image(`${interiorPath}/T4Q0996-300x200.jpg`, "Salón acogedor"),
      image(`${interiorPath}/cama_rosa-300x200.jpg`, "Dormitorio rosa"),
      image(`${interiorPath}/T4Q0958-300x200.jpg`, "Baño privado"),
      image(`${interiorPath}/Recortar_efecto-300x200.jpg`, "Detalle decorativo"),
      image(`${interiorPath}/T4Q0950-300x200.jpg`, "Habitación doble"),
      image(`${interiorPath}/T4Q0960-300x200.jpg`, "Baño completo"),
    ],
  },
  {
    id: "exterior",
    title: "Exterior",
    intro: "Fachada de piedra, jardín privado y espacios abiertos para disfrutar al aire libre.",
    tone: "accent",
    images: [
      image(`${exteriorPath}/fachada2-300x200.jpg`, "Fachada principal"),
      image(`${exteriorPath}/T4Q0905-300x200.jpg`, "Entrada de la casa"),
      image(`${exteriorPath}/Slider3-300x200.jpg`, "Vista exterior"),
      image(`${exteriorPath}/20150814_211149-300x200.jpg`, "Atardecer en la casa"),
      image(`${exteriorPath}/20140723_103727-300x200.jpg`, "Zona exterior"),
      image(`${exteriorPath}/20160611_212509-300x200.jpg`, "Jardín al anochecer"),
    ],
  },
  {
    id: "ocio",
    title: "Ocio",
    intro: "Momentos en familia, juegos, naturaleza cercana y planes tranquilos alrededor de la casa.",
    tone: "copy",
    images: [
      image(`${ocioPath}/La-Galana-Casa-Rural-Trabazos-Aliste-Zamora-Escapada-en-familia-35-Imagen-protegida-con-derechos-de-autor-dafy-agencia-1024x576.jpg`, "Escapada en familia"),
      image(`${ocioPath}/La-Galana-Casa-Rural-Trabazos-Aliste-Zamora-Escapada-en-familia-14-Imagen-protegida-con-derechos-de-autor-dafy-agencia-1024x576.jpg`, "Tarde de juegos"),
      image(`${ocioPath}/La-Galana-Casa-Rural-Trabazos-Aliste-Zamora-Escapada-en-familia-42-Imagen-protegida-con-derechos-de-autor-dafy-agencia-1024x576.jpg`, "Plan en grupo"),
      image(`${ocioPath}/La-Galana-Casa-Rural-Trabazos-Aliste-Zamora-Escapada-en-familia-29-Imagen-protegida-con-derechos-de-autor-dafy-agencia-1024x576.jpg`, "Rincón de lectura"),
      image(`${ocioPath}/La-Galana-Casa-Rural-Trabazos-Aliste-Zamora-Escapada-en-familia-41-Imagen-protegida-con-derechos-de-autor-dafy-agencia-1024x576.jpg`, "Comida familiar"),
      image(`${ocioPath}/La-Galana-Casa-Rural-Trabazos-Aliste-Zamora-Escapada-en-familia-31-Imagen-protegida-con-derechos-de-autor-dafy-agencia-1024x576.jpg`, "Descanso compartido"),
      image(`${ocioPath}/La-Galana-Casa-Rural-Trabazos-Aliste-Zamora-Escapada-en-familia-26-Imagen-protegida-con-derechos-de-autor-dafy-agencia-1024x576.jpg`, "Niños jugando"),
      image(`${ocioPath}/La-Galana-Casa-Rural-Trabazos-Aliste-Zamora-Escapada-en-familia-16-Imagen-protegida-con-derechos-de-autor-dafy-agencia-1024x576.jpg`, "Ocio en la casa"),
      image(`${ocioPath}/La-Galana-Casa-Rural-Trabazos-Aliste-Zamora-Escapada-en-familia-25-Imagen-protegida-con-derechos-de-autor-dafy-agencia-1024x576.jpg`, "Tiempo en familia"),
      image(`${ocioPath}/La-Galana-Casa-Rural-Trabazos-Aliste-Zamora-Escapada-en-familia-30-Imagen-protegida-con-derechos-de-autor-dafy-agencia-1024x576.jpg`, "Ambiente familiar"),
      image(`${ocioPath}/La-Galana-Casa-Rural-Trabazos-Aliste-Zamora-Escapada-en-familia-4-Imagen-protegida-con-derechos-de-autor-dafy-agencia-1024x576.jpg`, "Plan tranquilo"),
      image(`${ocioPath}/La-Galana-Casa-Rural-Trabazos-Aliste-Zamora-Escapada-en-familia-6-Imagen-protegida-con-derechos-de-autor-dafy-agencia-1024x576.jpg`, "Mesa compartida"),
    ],
  },
];

