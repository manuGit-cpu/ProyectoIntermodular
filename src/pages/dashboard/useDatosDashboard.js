import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { mostrarAlertaApp } from "../../utils/appAlert";
import { obtenerDatosMantenimientoGaleria } from "../../services/galleryService";

export function useDatosDashboard() {
  const [categorias, setCategorias] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [extras, setExtras] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = useCallback(async () => {
    setCargando(true);

    if (!supabase) {
      setCategorias([]);
      setReservas([]);
      setUsuarios([]);
      setExtras([]);
      setTemporadas([]);
      setCargando(false);
      return;
    }

    const [
      datosGaleria,
      datosReservas,
      datosUsuarios,
      datosExtras,
      datosTemporadas,
    ] = await Promise.all([
      obtenerDatosMantenimientoGaleria(),
      supabase
        .from("reservas")
        .select(
          "id, usuario_id, nombre_cliente, email_cliente, telefono_cliente, numero_personas, created_at, fecha_entrada, fecha_salida, precio_alojamiento, precio_extras, precio_total"
        )
        .order("created_at", { ascending: false })
        .limit(120),
      supabase.from("usuarios").select("id, nombre, email, telefono, rol, created_at").order("created_at", { ascending: false }),
      supabase.from("extras").select("id, nombre, descripcion, precio, activo, created_at").order("nombre", { ascending: true }),
      supabase
        .from("temporadas_precios")
        .select("id, nombre, activo, precio, mes_inicio, mes_fin, created_at")
        .order("mes_inicio", { ascending: true }),
    ]);

    if (datosGaleria.error) {
      mostrarAlertaApp({
        title: "No se pudo cargar la galeria",
        message: datosGaleria.error.message,
        variant: "warning",
      });
    }

    if (datosReservas.error || datosUsuarios.error || datosExtras.error || datosTemporadas.error) {
      mostrarAlertaApp({
        title: "Resumen no disponible",
        message:
          datosReservas.error?.message ||
          datosUsuarios.error?.message ||
          datosExtras.error?.message ||
          datosTemporadas.error?.message ||
          "No se pudieron cargar todos los indicadores.",
        variant: "warning",
      });
    }

    setCategorias(datosGaleria.categories || []);
    setReservas(datosReservas.data ?? []);
    setUsuarios(datosUsuarios.data ?? []);
    setExtras(datosExtras.data ?? []);
    setTemporadas(datosTemporadas.data ?? []);
    setCargando(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(cargarDatos, 0);
    return () => window.clearTimeout(timeoutId);
  }, [cargarDatos]);

  return {
    categorias,
    reservas,
    usuarios,
    extras,
    temporadas,
    cargando,
    recargar: cargarDatos,
    supabaseDisponible: Boolean(supabase),
  };
}
