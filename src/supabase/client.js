import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Cliente solo si hay URL y anon key (sin esto la app fallaba en blanco al importar). */
export const supabase =
  url && key ? createClient(url, key) : null;

