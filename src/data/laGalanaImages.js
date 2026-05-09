const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BASE_PATH = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/la-galana`
  : "/images/la-galana";

export const obtenerImagenLaGalana = (path) => `${BASE_PATH}/${path}`;

export const FEATURED_IMAGES = {
  hero: obtenerImagenLaGalana("exterior/exterior-casa.webp"),
  login: obtenerImagenLaGalana("interior/rincon-descanso.webp"),
  reservation: obtenerImagenLaGalana("interior/dormitorio-calido.webp"),
  exterior: obtenerImagenLaGalana("exterior/T4Q0905.webp"),
  kitchen: obtenerImagenLaGalana("interior/T4Q0913.webp"),
  livingRoom: obtenerImagenLaGalana("interior/T4Q0930.webp"),
  bedroom: obtenerImagenLaGalana("interior/T4Q0958.webp"),
};

export const EXTERIOR_IMAGES = [
  ["exterior/T4Q0885.webp", "Fachada de piedra"],
  ["exterior/T4Q0890.webp", "Patio de entrada"],
  ["exterior/T4Q0893.webp", "Exterior de la casa"],
  ["exterior/T4Q0895.webp", "Entrada principal"],
  ["exterior/T4Q0896.webp", "Detalle de fachada"],
  ["exterior/T4Q0905.webp", "Vista lateral"],
];

export const INTERIOR_IMAGES = [
  ["interior/T4Q0913.webp", "Cocina equipada"],
  ["interior/T4Q0917.webp", "Detalle decorativo"],
  ["interior/T4Q0918.webp", "Comedor luminoso"],
  ["interior/T4Q0922.webp", "Salon principal"],
  ["interior/T4Q0923.webp", "Zona de comedor"],
  ["interior/T4Q0924.webp", "Salon desde la planta superior"],
  ["interior/T4Q0929.webp", "Vista del salon"],
  ["interior/T4Q0930.webp", "Rincon de descanso"],
  ["interior/T4Q0933.webp", "Detalle de pared"],
  ["interior/T4Q0936.webp", "Chimenea y television"],
  ["interior/T4Q0940.webp", "Cocina y comedor"],
  ["interior/T4Q0941.webp", "Entrada interior"],
  ["interior/T4Q0944.webp", "Dormitorio doble"],
  ["interior/T4Q0949.webp", "Habitacion doble"],
  ["interior/T4Q0950.webp", "Bano rosa"],
  ["interior/T4Q0955.webp", "Escalera interior"],
  ["interior/T4Q0958.webp", "Dormitorio principal"],
  ["interior/T4Q0960.webp", "Bano completo"],
  ["interior/T4Q0968.webp", "Cama doble"],
  ["interior/T4Q0971.webp", "Detalle de planta superior"],
  ["interior/T4Q0973.webp", "Pasillo superior"],
  ["interior/T4Q0975.webp", "Mirador interior"],
  ["interior/T4Q0977.webp", "Zona abuhardillada"],
  ["interior/T4Q0979.webp", "Dormitorio abuhardillado"],
  ["interior/T4Q0980.webp", "Bano abuhardillado"],
  ["interior/T4Q0988.webp", "Dormitorio calido"],
  ["interior/T4Q0994.webp", "Dormitorio con camas individuales"],
  ["interior/T4Q0996.webp", "Habitacion familiar"],
  ["interior/T4Q0999.webp", "Bano superior"],
];
