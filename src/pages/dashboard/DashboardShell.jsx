import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import BarraNavegacion from "../../components/NavBar";
import PiePagina from "../../layouts/Footer";
import ResumenPanel from "../../components/ResumenPanel";
import {
  crearCategoriaGaleria,
  obtenerUrlImagenPublica,
  subirImagenGaleria,
} from "../../services/galleryService";
import { mostrarAlertaApp } from "../../utils/appAlert";
import { supabase } from "../../supabase/client";
import { useDatosDashboard } from "./useDatosDashboard";

function generarSlug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function obtenerFechaLegible(fechaValor) {
  if (!fechaValor) return "--";
  const fecha = new Date(fechaValor);
  if (Number.isNaN(fecha.getTime())) return "--";

  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

function formatearTextoPdf(valor) {
  return String(valor ?? "").trim();
}

function formatearNombreMes(numeroMes) {
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const indice = Number(numeroMes) - 1;
  return meses[indice] || "--";
}

function formatearPeriodoTemporada(temporada) {
  const inicio = formatearNombreMes(temporada.mes_inicio);
  const fin = formatearNombreMes(temporada.mes_fin);
  return inicio === fin ? inicio : `${inicio} - ${fin}`;
}

function obtenerInicialesUsuario(nombre, email = "") {
  const textoBase = String(nombre || email || "").trim();
  if (!textoBase) return "US";

  const partes = textoBase.split(/\s+/).filter(Boolean);
  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0] || ""}${partes[1][0] || ""}`.toUpperCase();
}

function formatearFechaCorta(fechaValor) {
  if (!fechaValor) return "--";
  const fecha = new Date(fechaValor);
  if (Number.isNaN(fecha.getTime())) return "--";

  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}

function formatearFechaInput(fechaValor) {
  if (!fechaValor) return "";
  const fecha = new Date(fechaValor);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toISOString().slice(0, 10);
}

function obtenerEstadoUsuario(reservaUsuario = {}, usuario = {}) {
  const tieneActividad = Number(reservaUsuario.reservas || 0) > 0;
  const fechaAlta = usuario.created_at ? new Date(usuario.created_at) : null;
  const esReciente = fechaAlta && !Number.isNaN(fechaAlta.getTime()) && Date.now() - fechaAlta.getTime() < 1000 * 60 * 60 * 24 * 30;

  return tieneActividad || esReciente ? "Activo" : "Offline";
}

const MESES_TEMPORADA = [
  { valor: 1, etiqueta: "Enero" },
  { valor: 2, etiqueta: "Febrero" },
  { valor: 3, etiqueta: "Marzo" },
  { valor: 4, etiqueta: "Abril" },
  { valor: 5, etiqueta: "Mayo" },
  { valor: 6, etiqueta: "Junio" },
  { valor: 7, etiqueta: "Julio" },
  { valor: 8, etiqueta: "Agosto" },
  { valor: 9, etiqueta: "Septiembre" },
  { valor: 10, etiqueta: "Octubre" },
  { valor: 11, etiqueta: "Noviembre" },
  { valor: 12, etiqueta: "Diciembre" },
];

function Icono({ name, className = "h-5 w-5" }) {
  const paths = {
    folder: (
      <path d="M3 6.75A2.25 2.25 0 0 1 5.25 4.5h3.1c.6 0 1.17.24 1.59.66l1.18 1.18c.42.42.99.66 1.59.66h6.04A2.25 2.25 0 0 1 21 9.25v7.5A2.25 2.25 0 0 1 18.75 19H5.25A2.25 2.25 0 0 1 3 16.75v-10Z" />
    ),
    image: (
      <>
        <path d="M4.75 5.25h14.5a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5H4.75a1.5 1.5 0 0 1-1.5-1.5V6.75a1.5 1.5 0 0 1 1.5-1.5Z" />
        <path d="m5 16 4.25-4.25 3 3L14.5 12.5 19 17" />
        <path d="M15.5 9.25h.01" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    pencil: (
      <>
        <path d="m4.5 19.5 4.5-1 9.8-9.8a1.5 1.5 0 0 0 0-2.1l-1.9-1.9a1.5 1.5 0 0 0-2.1 0L5 14.6l-1 4.9Z" />
        <path d="m13.5 6.5 4 4" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V5" />
        <path d="m7.5 9.5 4.5-4.5 4.5 4.5" />
        <path d="M5 19h14" />
      </>
    ),
    trash: (
      <>
        <path d="M6 7h12" />
        <path d="M10 11v5" />
        <path d="M14 11v5" />
        <path d="m9 7 .75-2h4.5L15 7" />
        <path d="M8 7v11a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 18V7" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.25-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.25 5.5-9.5 5.5S2.5 12 2.5 12Z" />
        <path d="M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      </>
    ),
    spark: (
      <>
        <path d="M13 3 6.5 13H12l-1 8 6.5-10H11l2-8Z" />
      </>
    ),
    users: (
      <>
        <path d="M16 18.5c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
        <path d="M12 13.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" />
        <path d="M19.5 18.5c0-1.6-1-3-2.5-3.6" />
        <path d="M17.5 7.5a2.5 2.5 0 1 1 0 5" />
      </>
    ),
    ticket: (
      <>
        <path d="M4.5 8.5A2.5 2.5 0 0 0 7 6h10a2.5 2.5 0 0 0 2.5 2.5v7A2.5 2.5 0 0 0 17 18H7a2.5 2.5 0 0 0-2.5-2.5v-7Z" />
        <path d="M9 10h6" />
        <path d="M9 13h4" />
      </>
    ),
    season: (
      <>
        <path d="M12 4v16" />
        <path d="M6.5 7.5c1.5-1.5 3.5-2.3 5.5-2.3s4 .8 5.5 2.3" />
        <path d="M6.5 16.5c1.5 1.5 3.5 2.3 5.5 2.3s4-.8 5.5-2.3" />
      </>
    ),
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function TarjetaResumen({ label, value, icon }) {
  return (
    <div className="rounded-[1.3rem] border border-brand/10 bg-white px-5 py-4 shadow-[0_10px_26px_rgba(44,44,44,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/12 text-brand-dark">
          <Icono name={icon} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 font-display text-4xl leading-none text-copy">{value}</p>
    </div>
  );
}

function obtenerNombreSeccion(vista) {
  if (vista === "reservas") return "Reservas";
  if (vista === "galeria") return "Galeria";
  if (vista === "configuracion") return "Configuracion";
  return "Resumen";
}

export default function DashboardShell({ vista = "resumen" }) {
  const { categorias, reservas, usuarios, extras, temporadas, cargando, recargar, supabaseDisponible } =
    useDatosDashboard();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [saving, setSaving] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [imageForm, setImageForm] = useState({ title: "", file: null });
  const [mostrarModalTemporada, setMostrarModalTemporada] = useState(false);
  const [temporadaEnEdicion, setTemporadaEnEdicion] = useState(null);
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [mostrarModalFiltroUsuarios, setMostrarModalFiltroUsuarios] = useState(false);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null);
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [reservaEnEdicion, setReservaEnEdicion] = useState(null);
  const [mostrarModalExtra, setMostrarModalExtra] = useState(false);
  const [extraEnEdicion, setExtraEnEdicion] = useState(null);
  const [filtroUsuarios, setFiltroUsuarios] = useState({
    busqueda: "",
    rol: "todos",
    estado: "todos",
  });
  const [formUsuario, setFormUsuario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    rol: "cliente",
  });
  const [formReserva, setFormReserva] = useState({
    nombre_cliente: "",
    email_cliente: "",
    telefono_cliente: "",
    fecha_entrada: "",
    fecha_salida: "",
    numero_personas: 1,
    precio_alojamiento: "",
    precio_extras: "",
    precio_total: "",
  });
  const [formExtra, setFormExtra] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    activo: true,
  });
  const [nuevaTemporada, setNuevaTemporada] = useState({
    nombre: "",
    mes_inicio: 6,
    mes_fin: 9,
    precio: "",
    activo: true,
  });

  const selectedCategory = useMemo(
    () => categorias.find((category) => category.id === selectedCategoryId),
    [categorias, selectedCategoryId]
  );
  const selectedImages = selectedCategory?.galeria_imagenes || [];
  const previewImage = selectedImages[0] || categorias.flatMap((category) => category.galeria_imagenes || [])[0];
  const temporadasOrdenadas = useMemo(
    () => [...temporadas].sort((a, b) => Number(a.mes_inicio || 0) - Number(b.mes_inicio || 0)),
    [temporadas]
  );
  const reservasRecientes = useMemo(
    () =>
      [...reservas]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 6),
    [reservas]
  );
  const estadisticasTemporadas = useMemo(
    () => ({
      activas: temporadas.filter((temporada) => temporada.activo).length,
      inactivas: temporadas.filter((temporada) => !temporada.activo).length,
      precioMedio:
        temporadas.length > 0
          ? temporadas.reduce((total, temporada) => total + Number(temporada.precio || 0), 0) / temporadas.length
          : 0,
    }),
    [temporadas]
  );
  const actividadUsuarios = useMemo(() => {
    const mapa = new Map();

    reservas.forEach((reserva) => {
      if (!reserva.usuario_id) return;

      const actual = mapa.get(reserva.usuario_id) || { reservas: 0, ultimaReserva: null };
      actual.reservas += 1;

      if (!actual.ultimaReserva || new Date(reserva.created_at || 0) > new Date(actual.ultimaReserva || 0)) {
        actual.ultimaReserva = reserva.created_at;
      }

      mapa.set(reserva.usuario_id, actual);
    });

    return mapa;
  }, [reservas]);
  const usuariosOrdenados = useMemo(
    () => [...usuarios].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)),
    [usuarios]
  );
  const usuariosFiltrados = useMemo(() => {
    const busqueda = filtroUsuarios.busqueda.trim().toLowerCase();

    return usuariosOrdenados.filter((usuario) => {
      const actividad = actividadUsuarios.get(usuario.id) || { reservas: 0, ultimaReserva: null };
      const estadoUsuario = obtenerEstadoUsuario(actividad, usuario);
      const coincideBusqueda =
        !busqueda ||
        [usuario.nombre, usuario.email, usuario.rol]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(busqueda);
      const coincideRol =
        filtroUsuarios.rol === "todos" || String(usuario.rol || "").toLowerCase() === filtroUsuarios.rol;
      const coincideEstado =
        filtroUsuarios.estado === "todos" || estadoUsuario.toLowerCase() === filtroUsuarios.estado;

      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }, [actividadUsuarios, filtroUsuarios.busqueda, filtroUsuarios.estado, filtroUsuarios.rol, usuariosOrdenados]);
  const usuariosVisibles = usuariosFiltrados.slice(0, 4);
  const estadisticasUsuarios = useMemo(
    () => ({
      admins: usuarios.filter((usuario) => String(usuario.rol || "").toLowerCase().includes("admin")).length,
      clientesActivos: usuarios.filter((usuario) => Number(actividadUsuarios.get(usuario.id)?.reservas || 0) > 0).length,
      pendientes: usuarios.filter((usuario) => Number(actividadUsuarios.get(usuario.id)?.reservas || 0) === 0).length,
    }),
    [actividadUsuarios, usuarios]
  );
  const extrasOrdenados = useMemo(
    () => [...extras].sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || ""))),
    [extras]
  );
  const estadisticasExtras = useMemo(
    () => ({
      activos: extras.filter((extra) => extra.activo).length,
      inactivos: extras.filter((extra) => !extra.activo).length,
      precioMedio:
        extras.length > 0
          ? extras.reduce((total, extra) => total + Number(extra.precio || 0), 0) / extras.length
          : 0,
      ingresosPotenciales: extras
        .filter((extra) => extra.activo)
        .reduce((total, extra) => total + Number(extra.precio || 0), 0),
    }),
    [extras]
  );

  function dibujarCabeceraPdf(doc, titulo, subtitulo, numeroPagina) {
    doc.setFillColor(194, 168, 120);
    doc.rect(0, 0, 210, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(titulo, 14, 13);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(subtitulo, 14, 18);
    doc.setTextColor(60, 49, 33);
    doc.setFontSize(9);
    doc.text(`Pagina ${numeroPagina}`, 182, 13);
  }

  function dibujarLineaCampo(doc, etiqueta, valor, x, y, ancho = 82) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(etiqueta, x, y);
    doc.setFont("helvetica", "normal");
    doc.setDrawColor(216, 205, 187);
    doc.line(x, y + 2, x + ancho, y + 2);
    doc.setFontSize(9);
    doc.text(formatearTextoPdf(valor), x, y + 7);
  }

  function dibujarLineaFirma(doc, x, y, ancho = 70) {
    doc.setDrawColor(120, 110, 94);
    doc.line(x, y, x + ancho, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Firma", x, y + 5);
  }

  async function alternarEstadoTemporada(temporada) {
    if (!supabase || !temporada) return;

    const nuevoEstado = !temporada.activo;
    const { error } = await supabase
      .from("temporadas_precios")
      .update({ activo: nuevoEstado })
      .eq("id", temporada.id);

    if (error) {
      mostrarAlertaApp({
        title: "No se pudo actualizar la temporada",
        message: error.message,
        variant: "warning",
      });
      return;
    }

    mostrarAlertaApp({
      title: nuevoEstado ? "Temporada activada" : "Temporada desactivada",
      message: `${temporada.nombre} ya se ha actualizado correctamente.`,
      variant: "success",
    });
    recargar();
  }


  function abrirModalEditarTemporada(temporada) {
    setTemporadaEnEdicion(temporada?.id || null);
    setNuevaTemporada({
      nombre: temporada?.nombre || "",
      mes_inicio: Number(temporada?.mes_inicio || 6),
      mes_fin: Number(temporada?.mes_fin || 9),
      precio: temporada?.precio ?? "",
      activo: Boolean(temporada?.activo),
    });
    setMostrarModalTemporada(true);
  }

  function cerrarModalTemporada() {
    setMostrarModalTemporada(false);
    setTemporadaEnEdicion(null);
  }

  function manejarCambioNuevaTemporada(event) {
    const { name, value, type, checked } = event.target;

    setNuevaTemporada((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function manejarCrearTemporada(event) {
    event.preventDefault();

    if (!supabase) {
      mostrarAlertaApp({
        title: "Base de datos no disponible",
        message: "No se pudo conectar con Supabase.",
        variant: "warning",
      });
      return;
    }

    const nombre = nuevaTemporada.nombre.trim();
    const mesInicio = Number(nuevaTemporada.mes_inicio);
    const mesFin = Number(nuevaTemporada.mes_fin);
    const precio = Number(nuevaTemporada.precio);

    if (!nombre || !mesInicio || !mesFin || Number.isNaN(precio)) {
      mostrarAlertaApp({
        title: "Faltan datos",
        message: "Completa nombre, meses y precio para crear la temporada.",
        variant: "warning",
      });
      return;
    }

    if (mesInicio < 1 || mesInicio > 12 || mesFin < 1 || mesFin > 12) {
      mostrarAlertaApp({
        title: "Mes invalido",
        message: "Selecciona meses entre enero y diciembre.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);
    const payloadTemporada = {
      nombre,
      mes_inicio: mesInicio,
      mes_fin: mesFin,
      precio,
      activo: nuevaTemporada.activo,
    };

    const consultaTemporada = temporadaEnEdicion
      ? supabase.from("temporadas_precios").update(payloadTemporada).eq("id", temporadaEnEdicion)
      : supabase.from("temporadas_precios").insert([payloadTemporada]);

    const { error } = await consultaTemporada;
    setSaving(false);

    if (error) {
      mostrarAlertaApp({
        title: "No se pudo crear la temporada",
        message: error.message,
        variant: "warning",
      });
      return;
    }

    setNuevaTemporada({
      nombre: "",
      mes_inicio: 6,
      mes_fin: 9,
      precio: "",
      activo: true,
    });
    cerrarModalTemporada();
    mostrarAlertaApp({
      title: temporadaEnEdicion ? "Temporada actualizada" : "Temporada creada",
      message: temporadaEnEdicion
        ? "Los cambios se han guardado correctamente."
        : "La nueva temporada ya aparece en la lista.",
      variant: "success",
    });
    recargar();
  }

  function abrirModalEditarUsuario(usuario) {
    if (!usuario) return;

    setUsuarioEnEdicion(usuario.id || null);
    setFormUsuario({
      nombre: usuario.nombre || "",
      email: usuario.email || "",
      telefono: usuario.telefono || "",
      rol: usuario.rol || "cliente",
    });
    setMostrarModalUsuario(true);
  }

  function cerrarModalUsuario() {
    setMostrarModalUsuario(false);
    setUsuarioEnEdicion(null);
  }

  function manejarCambioUsuario(event) {
    const { name, value } = event.target;

    setFormUsuario((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function abrirModalFiltroUsuarios() {
    setMostrarModalFiltroUsuarios(true);
  }

  function cerrarModalFiltroUsuarios() {
    setMostrarModalFiltroUsuarios(false);
  }

  function manejarCambioFiltroUsuarios(event) {
    const { name, value } = event.target;

    setFiltroUsuarios((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function limpiarFiltrosUsuarios() {
    setFiltroUsuarios({
      busqueda: "",
      rol: "todos",
      estado: "todos",
    });
  }

  async function manejarGuardarUsuario(event) {
    event.preventDefault();

    if (!supabase) {
      mostrarAlertaApp({
        title: "Base de datos no disponible",
        message: "No se pudo conectar con Supabase.",
        variant: "warning",
      });
      return;
    }

    const nombre = formUsuario.nombre.trim();
    const email = formUsuario.email.trim().toLowerCase();
    const telefono = formUsuario.telefono.trim();
    const rol = formUsuario.rol.trim().toLowerCase();

    if (!nombre || !email) {
      mostrarAlertaApp({
        title: "Faltan datos",
        message: "Completa nombre y email para guardar el usuario.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);
    if (!usuarioEnEdicion) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            nombre,
            rol: rol || "cliente",
          },
        },
      });

      setSaving(false);

      if (error) {
        mostrarAlertaApp({
          title: "No se pudo enviar la invitacion",
          message: error.message,
          variant: "warning",
        });
        return;
      }

      cerrarModalUsuario();
      mostrarAlertaApp({
        title: "Invitacion enviada",
        message: "El usuario recibira un enlace para acceder a su cuenta y su perfil se creara al iniciar sesion.",
        variant: "success",
      });
      return;
    }

    const { error } = await supabase
      .from("usuarios")
      .update({
        nombre,
        email,
        telefono: telefono || null,
        rol: rol || "cliente",
      })
      .eq("id", usuarioEnEdicion);
    setSaving(false);

    if (error) {
      mostrarAlertaApp({
        title: "No se pudo guardar el usuario",
        message: error.message,
        variant: "warning",
      });
      return;
    }

    cerrarModalUsuario();
    mostrarAlertaApp({
      title: usuarioEnEdicion ? "Usuario actualizado" : "Usuario creado",
      message: "Los cambios se han guardado correctamente.",
      variant: "success",
    });
    recargar();
  }

  async function manejarEliminarUsuario(usuario) {
    if (!usuario) return;

    const confirmado = window.confirm(`Eliminar el usuario "${usuario.nombre || usuario.email}"?`);
    if (!confirmado) return;

    if (!supabase) {
      mostrarAlertaApp({
        title: "Base de datos no disponible",
        message: "No se pudo conectar con Supabase.",
        variant: "warning",
      });
      return;
    }

    const { error } = await supabase.from("usuarios").delete().eq("id", usuario.id);

    if (error) {
      mostrarAlertaApp({
        title: "No se pudo eliminar el usuario",
        message: error.message,
        variant: "warning",
      });
      return;
    }

    mostrarAlertaApp({
      title: "Usuario eliminado",
      message: "El perfil se ha quitado correctamente.",
      variant: "success",
    });
    recargar();
  }

  function abrirModalNuevoExtra() {
    setExtraEnEdicion(null);
    setFormExtra({
      nombre: "",
      descripcion: "",
      precio: "",
      activo: true,
    });
    setMostrarModalExtra(true);
  }

  function abrirModalEditarExtra(extra) {
    if (!extra) return;

    setExtraEnEdicion(extra.id || null);
    setFormExtra({
      nombre: extra.nombre || "",
      descripcion: extra.descripcion || "",
      precio: extra.precio ?? "",
      activo: Boolean(extra.activo),
    });
    setMostrarModalExtra(true);
  }

  function cerrarModalExtra() {
    setMostrarModalExtra(false);
    setExtraEnEdicion(null);
  }

  function manejarCambioExtra(event) {
    const { name, value, type, checked } = event.target;

    setFormExtra((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function manejarGuardarExtra(event) {
    event.preventDefault();

    if (!supabase) {
      mostrarAlertaApp({
        title: "Base de datos no disponible",
        message: "No se pudo conectar con Supabase.",
        variant: "warning",
      });
      return;
    }

    const nombre = formExtra.nombre.trim();
    const descripcion = formExtra.descripcion.trim();
    const precio = Number(formExtra.precio);

    if (!nombre || Number.isNaN(precio)) {
      mostrarAlertaApp({
        title: "Faltan datos",
        message: "Completa nombre y precio para guardar el servicio extra.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);
    const payloadExtra = {
      nombre,
      descripcion: descripcion || null,
      precio,
      activo: formExtra.activo,
    };

    const consultaExtra = extraEnEdicion
      ? supabase.from("extras").update(payloadExtra).eq("id", extraEnEdicion)
      : supabase.from("extras").insert([payloadExtra]);

    const { error } = await consultaExtra;
    setSaving(false);

    if (error) {
      mostrarAlertaApp({
        title: "No se pudo guardar el servicio",
        message: error.message,
        variant: "warning",
      });
      return;
    }

    cerrarModalExtra();
    mostrarAlertaApp({
      title: extraEnEdicion ? "Servicio actualizado" : "Servicio creado",
      message: "La lista se ha actualizado correctamente.",
      variant: "success",
    });
    recargar();
  }

  async function alternarEstadoExtra(extra) {
    if (!supabase || !extra) return;

    const nuevoEstado = !extra.activo;
    const { error } = await supabase.from("extras").update({ activo: nuevoEstado }).eq("id", extra.id);

    if (error) {
      mostrarAlertaApp({
        title: "No se pudo actualizar el servicio",
        message: error.message,
        variant: "warning",
      });
      return;
    }

    mostrarAlertaApp({
      title: nuevoEstado ? "Servicio activado" : "Servicio desactivado",
      message: `${extra.nombre} ya se ha actualizado correctamente.`,
      variant: "success",
    });
    recargar();
  }

  async function manejarEliminarExtra(extra) {
    if (!extra) return;

    const confirmado = window.confirm(`Eliminar el servicio extra "${extra.nombre}"?`);
    if (!confirmado) return;

    if (!supabase) {
      mostrarAlertaApp({
        title: "Base de datos no disponible",
        message: "No se pudo conectar con Supabase.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);
    await supabase.from("reservas_extras").delete().eq("extra_id", extra.id);
    const { error } = await supabase.from("extras").delete().eq("id", extra.id);
    setSaving(false);

    if (error) {
      mostrarAlertaApp({
        title: "No se pudo eliminar el servicio",
        message: error.message,
        variant: "warning",
      });
      return;
    }

    mostrarAlertaApp({
      title: "Servicio eliminado",
      message: "El servicio y sus referencias se han borrado correctamente.",
      variant: "success",
    });
    recargar();
  }

  function abrirModalNuevaReserva(reserva) {
    setReservaEnEdicion(reserva?.id || null);
    setFormReserva({
      nombre_cliente: reserva?.nombre_cliente || "",
      email_cliente: reserva?.email_cliente || "",
      telefono_cliente: reserva?.telefono_cliente || "",
      fecha_entrada: formatearFechaInput(reserva?.fecha_entrada),
      fecha_salida: formatearFechaInput(reserva?.fecha_salida),
      numero_personas: Number(reserva?.numero_personas || 1),
      precio_alojamiento: reserva?.precio_alojamiento ?? "",
      precio_extras: reserva?.precio_extras ?? "",
      precio_total: reserva?.precio_total ?? "",
    });
    setMostrarModalReserva(true);
  }

  function cerrarModalReserva() {
    setMostrarModalReserva(false);
    setReservaEnEdicion(null);
  }

  function manejarCambioReserva(event) {
    const { name, value } = event.target;

    setFormReserva((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  async function manejarGuardarReserva(event) {
    event.preventDefault();

    if (!supabase) {
      mostrarAlertaApp({
        title: "Base de datos no disponible",
        message: "No se pudo conectar con Supabase.",
        variant: "warning",
      });
      return;
    }

    const nombreCliente = formReserva.nombre_cliente.trim();
    const emailCliente = formReserva.email_cliente.trim();
    const telefonoCliente = formReserva.telefono_cliente.trim();
    const fechaEntrada = formReserva.fecha_entrada;
    const fechaSalida = formReserva.fecha_salida;
    const numeroPersonas = Number(formReserva.numero_personas);
    const precioAlojamiento = Number(formReserva.precio_alojamiento);
    const precioExtras = Number(formReserva.precio_extras);
    const precioTotal = Number(formReserva.precio_total);

    if (!nombreCliente || !emailCliente || !fechaEntrada || !fechaSalida || !numeroPersonas) {
      mostrarAlertaApp({
        title: "Faltan datos",
        message: "Completa cliente, fechas y numero de personas.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);
    const payloadReserva = {
      nombre_cliente: nombreCliente,
      email_cliente: emailCliente,
      telefono_cliente: telefonoCliente || null,
      fecha_entrada: fechaEntrada,
      fecha_salida: fechaSalida,
      numero_personas: numeroPersonas,
      precio_alojamiento: Number.isNaN(precioAlojamiento) ? 0 : precioAlojamiento,
      precio_extras: Number.isNaN(precioExtras) ? 0 : precioExtras,
      precio_total: Number.isNaN(precioTotal) ? 0 : precioTotal,
    };

    const consultaReserva = reservaEnEdicion
      ? supabase.from("reservas").update(payloadReserva).eq("id", reservaEnEdicion)
      : supabase.from("reservas").insert([payloadReserva]);

    const { error } = await consultaReserva;
    setSaving(false);

    if (error) {
      mostrarAlertaApp({
        title: "No se pudo guardar la reserva",
        message: error.message,
        variant: "warning",
      });
      return;
    }

    cerrarModalReserva();
    mostrarAlertaApp({
      title: reservaEnEdicion ? "Reserva actualizada" : "Reserva guardada",
      message: "La informacion se ha actualizado correctamente.",
      variant: "success",
    });
    recargar();
  }

  async function manejarEliminarReserva(reserva) {
    if (!reserva) return;

    const confirmado = window.confirm(`Eliminar la reserva de "${reserva.nombre_cliente || reserva.email_cliente}"?`);
    if (!confirmado) return;

    if (!supabase) {
      mostrarAlertaApp({
        title: "Base de datos no disponible",
        message: "No se pudo conectar con Supabase.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);
    await supabase.from("reservas_extras").delete().eq("reserva_id", reserva.id);
    const { error } = await supabase.from("reservas").delete().eq("id", reserva.id);
    setSaving(false);

    if (error) {
      mostrarAlertaApp({
        title: "No se pudo eliminar la reserva",
        message: error.message,
        variant: "warning",
      });
      return;
    }

    mostrarAlertaApp({
      title: "Reserva eliminada",
      message: "La reserva y sus extras asociados se han borrado.",
      variant: "success",
    });
    recargar();
  }

  function generarPdfReserva(reserva) {
    if (!reserva) return;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const numeroPersonas = Math.max(1, Number(reserva.numero_personas || 1));
    const nombreArchivo = `reserva-${reserva.id || "detalle"}.pdf`;

    dibujarCabeceraPdf(doc, "Datos de la reserva", "Casa Rural La Galana", 1);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Resumen de la reserva", 14, 32);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const datosReserva = [
      ["Cliente", reserva.nombre_cliente],
      ["Email", reserva.email_cliente],
      ["Telefono", reserva.telefono_cliente],
      ["Personas", reserva.numero_personas],
      ["Entrada", obtenerFechaLegible(reserva.fecha_entrada)],
      ["Salida", obtenerFechaLegible(reserva.fecha_salida)],
      ["Precio alojamiento", formatearMoneda(reserva.precio_alojamiento)],
      ["Precio extras", formatearMoneda(reserva.precio_extras)],
      ["Total", formatearMoneda(reserva.precio_total)],
    ];

    let y = 42;
    datosReserva.forEach(([etiqueta, valor], index) => {
      const columnaX = index % 2 === 0 ? 14 : 108;
      dibujarLineaCampo(doc, etiqueta, valor, columnaX, y, 78);
      if (index % 2 === 1) y += 18;
    });

    const inicioViajerosY = Math.max(y + 24, 136);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Formulario de viajeros", 14, inicioViajerosY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Cada viajero debe completar sus datos y firmar en su pagina correspondiente.", 14, inicioViajerosY + 6);

    for (let viajero = 1; viajero <= numeroPersonas; viajero += 1) {
      doc.addPage();
      dibujarCabeceraPdf(doc, "Formulario de viajero", `Reserva ${formatearTextoPdf(reserva.nombre_cliente)}`, viajero + 1);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Viajero ${viajero}`, 14, 32);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Rellena los datos personales y firma al final del formulario.", 14, 38);

      const campos = [
        ["Nombre", ""],
        ["Apellidos", ""],
        ["DNI / Pasaporte", ""],
        ["Fecha de nacimiento", ""],
        ["Telefono", ""],
        ["Email", ""],
        ["Direccion", ""],
        ["Pais", ""],
      ];

      let filaY = 50;
      campos.forEach(([etiqueta], index) => {
        const x = index % 2 === 0 ? 14 : 108;
        dibujarLineaCampo(doc, etiqueta, "", x, filaY, 78);
        if (index % 2 === 1) filaY += 18;
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Firma del viajero", 14, 120);
      dibujarLineaFirma(doc, 14, 128, 90);

      doc.setFont("helvetica", "bold");
      doc.text("Observaciones", 14, 142);
      doc.setDrawColor(216, 205, 187);
      doc.roundedRect(14, 146, 182, 28, 3, 3);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Espacio libre para notas, autorizaciones o incidencias.", 18, 154);
    }

    const url = doc.output("bloburl");
    const ventana = window.open(url, "_blank", "noopener,noreferrer");
    if (ventana) {
      ventana.focus();
    } else {
      doc.save(nombreArchivo);
    }
  }

  async function manejarCrearCategoria(event) {
    event.preventDefault();
    const nombre = categoryName.trim();
    const slug = generarSlug(nombre);

    if (!nombre || !slug) {
      mostrarAlertaApp({
        title: "Faltan datos",
        message: "Indica al menos un nombre para la categoria.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);
    const { error } = await crearCategoriaGaleria({ nombre });
    setSaving(false);

    if (error) {
      mostrarAlertaApp({
        title: "No se creo la categoria",
        message: error.message,
        variant: "warning",
      });
      return;
    }

    setCategoryName("");
    setSelectedCategoryId(slug);
    mostrarAlertaApp({ title: "Carpeta creada", message: "Ya puedes subir imagenes ahi.", variant: "success" });
    window.dispatchEvent(new Event("gallery:changed"));
    recargar();
  }

  async function manejarSubirImagen(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!selectedCategory || !imageForm.file) {
      mostrarAlertaApp({
        title: "Seleccion incompleta",
        message: "Elige una categoria y una imagen para subir.",
        variant: "warning",
      });
      return;
    }

    setSaving(true);
    const { error } = await subirImagenGaleria({
      category: selectedCategory,
      file: imageForm.file,
      title: imageForm.title.trim(),
    });
    setSaving(false);

    if (error) {
      mostrarAlertaApp({
        title: "No se subio la imagen",
        message: error.message,
        variant: "warning",
      });
      return;
    }

    setImageForm({ title: "", file: null });
    form.reset();
    mostrarAlertaApp({ title: "Imagen subida", message: "La galeria publica ya puede usarla.", variant: "success" });
    window.dispatchEvent(new Event("gallery:changed"));
    recargar();
  }

  if (!supabaseDisponible) {
    return (
      <div className="min-h-screen bg-surface text-copy">
        <BarraNavegacion />
        <main className="mx-auto max-w-4xl px-6 pt-32 pb-20">
          <h1 className="font-display text-5xl">{obtenerNombreSeccion(vista)}</h1>
          <p className="mt-4 text-muted">Configura Supabase para gestionar el dashboard.</p>
        </main>
        <PiePagina />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-copy">
      <BarraNavegacion />
      <main className="mx-auto max-w-[1800px] px-6 pt-28 pb-20 sm:px-10">
        {vista === "resumen" && (
          <section className="space-y-8">
            <ResumenPanel
              reservas={reservas}
              categorias={categorias}
              usuarios={usuarios}
              extras={extras}
              temporadas={temporadas}
              cargando={cargando}
            />

            <section className="grid gap-4 md:grid-cols-4">
              <TarjetaResumen label="Reservas" value={reservas.length} icon="spark" />
              <TarjetaResumen label="Usuarios" value={usuarios.length} icon="users" />
              <TarjetaResumen label="Extras" value={extras.filter((extra) => extra.activo).length} icon="ticket" />
              <TarjetaResumen label="Temporadas" value={temporadas.filter((temporada) => temporada.activo).length} icon="season" />
            </section>
          </section>
        )}

        {vista === "reservas" && (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <article className="rounded-[1.7rem] border border-brand/10 bg-white p-6 shadow-[0_14px_34px_rgba(44,44,44,0.06)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-dark">Reservas</p>
                  <h2 className="mt-2 font-display text-3xl text-copy">Actividad reciente</h2>
                </div>
                <a href="/#reserva" className="text-sm font-bold text-brand-dark no-underline">
                  Ver formulario
                </a>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.2rem] border border-brand/8">
                <table className="min-w-full divide-y divide-brand/10">
                  <thead className="bg-surface text-left text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    <tr>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Fechas</th>
                      <th className="px-4 py-3">Personas</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand/8 bg-white">
                    {reservasRecientes.length > 0 ? (
                      reservasRecientes.map((reserva) => (
                        <tr key={reserva.id} className="text-sm">
                          <td className="px-4 py-4">
                            <p className="font-bold text-copy">{reserva.nombre_cliente || "Sin nombre"}</p>
                            <p className="mt-1 text-xs text-muted">{reserva.email_cliente || "Sin email"}</p>
                          </td>
                          <td className="px-4 py-4 text-muted">
                            {obtenerFechaLegible(reserva.fecha_entrada)} - {obtenerFechaLegible(reserva.fecha_salida)}
                          </td>
                          <td className="px-4 py-4 font-semibold text-copy">{reserva.numero_personas || 0}</td>
                          <td className="px-4 py-4 font-semibold text-copy">{formatearMoneda(reserva.precio_total)}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-md border border-brand/20 bg-brand/8 px-3 py-2 text-xs font-bold text-brand-dark transition hover:bg-brand/14"
                                onClick={() => generarPdfReserva(reserva)}
                              >
                                Imprimir PDF
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-md border border-brand/12 bg-surface px-3 py-2 text-xs font-bold text-copy transition hover:bg-brand/8"
                                onClick={() => abrirModalNuevaReserva(reserva)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-md border border-red-700/12 bg-red-700/6 px-3 py-2 text-xs font-bold text-red-800 transition hover:bg-red-700/12"
                                onClick={() => manejarEliminarReserva(reserva)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-8 text-sm text-muted" colSpan={5}>
                          Todavia no hay reservas registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <aside className="rounded-[1.7rem] border border-brand/10 bg-[linear-gradient(135deg,#f7f3ea_0%,#efe3cd_100%)] p-5 shadow-[0_14px_34px_rgba(44,44,44,0.06)]">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-dark">Resumen rapido</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.1rem] bg-white/75 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Reservas</p>
                  <p className="mt-1 font-display text-3xl text-copy">{reservas.length}</p>
                </div>
                <div className="rounded-[1.1rem] bg-white/75 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Total ingresos</p>
                  <p className="mt-1 font-display text-3xl text-copy">
                    {formatearMoneda(reservas.reduce((total, reserva) => total + Number(reserva.precio_total || 0), 0))}
                  </p>
                </div>
              </div>
            </aside>
          </section>
        )}

        {vista === "galeria" && (
          <section>
            <section className="relative overflow-hidden rounded-lg bg-copy px-6 py-8 text-white shadow-[0_20px_60px_rgba(44,44,44,0.18)] sm:px-8 lg:px-10">
              {previewImage && (
                <img
                  className="absolute inset-0 h-full w-full object-cover opacity-28"
                  src={obtenerUrlImagenPublica(previewImage.storage_path || previewImage.storagePath)}
                  alt=""
                  aria-hidden="true"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-r from-copy via-copy/86 to-copy/45" />

              <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand">Panel privado</p>
                  <h1 className="mt-3 font-display text-5xl leading-tight sm:text-6xl">Gestion de galeria</h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/76">
                    Organiza las carpetas, sube nuevas imagenes y revisa lo que se vera en la galeria publica.
                  </p>
                </div>
                <a
                  href="/galeria"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/16 bg-white/12 px-4 py-3 text-sm font-bold text-white no-underline backdrop-blur-md transition hover:bg-white/18"
                >
                  <Icono name="eye" className="h-4 w-4" />
                  Ver galeria
                </a>
              </div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-3">
              <TarjetaResumen label="Categorias" value={categorias.length} icon="folder" />
              <TarjetaResumen label="Imagenes" value={categorias.reduce((total, category) => total + (category.galeria_imagenes?.length || 0), 0)} icon="image" />
              <TarjetaResumen label="Seleccion" value={selectedImages.length} icon="upload" />
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
              <aside className="grid content-start gap-5">
                <div className="rounded-lg border border-brand/12 bg-white p-5 shadow-[0_14px_34px_rgba(44,44,44,0.08)]">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-2xl">Carpetas</h2>
                    <span className="rounded-full bg-brand/12 px-3 py-1 text-xs font-bold text-brand-dark">
                      {categorias.length}
                    </span>
                  </div>

                  {cargando ? (
                    <p className="mt-5 text-sm font-semibold text-muted">Cargando mantenimiento...</p>
                  ) : (
                    <div className="mt-5 grid gap-2">
                      {categorias.map((category) => {
                        const isSelected = category.id === selectedCategoryId;
                        const imageCount = category.galeria_imagenes?.length || 0;

                        return (
                          <button
                            key={category.id}
                            type="button"
                            className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border px-3 py-3 text-left transition ${
                              isSelected
                                ? "border-brand/35 bg-brand/12 text-copy"
                                : "border-brand/10 bg-surface text-copy hover:border-brand/24 hover:bg-brand/8"
                            }`}
                            onClick={() => setSelectedCategoryId(category.id)}
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-brand-dark">
                              <Icono name="folder" className="h-5 w-5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold">{category.nombre}</span>
                              <span className="block truncate text-xs font-semibold text-muted">{category.slug}</span>
                            </span>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-muted">{imageCount}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <form className="rounded-lg border border-brand/12 bg-white p-5 shadow-[0_14px_34px_rgba(44,44,44,0.08)]" onSubmit={manejarCrearCategoria}>
                  <h2 className="font-display text-2xl">Nueva carpeta</h2>
                  <div className="mt-5 grid gap-4">
                    <label className="grid gap-2 text-sm font-semibold">
                      Nombre
                      <input
                        className="rounded-md border border-brand/16 px-3 py-2 font-normal outline-none focus:border-brand"
                        value={categoryName}
                        onChange={(event) => setCategoryName(event.target.value)}
                        placeholder="Habitaciones"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-md border-0 bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
                    >
                      <Icono name="plus" className="h-4 w-4" />
                      Crear categoria
                    </button>
                  </div>
                </form>
              </aside>

              <div className="grid content-start gap-6">
                <section className="rounded-lg border border-brand/12 bg-white p-5 shadow-[0_14px_34px_rgba(44,44,44,0.08)] sm:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark">Carpeta activa</p>
                      <h2 className="mt-2 font-display text-4xl">{selectedCategory?.nombre || "Sin seleccion"}</h2>
                      <p className="mt-2 text-sm font-semibold text-muted">
                        {selectedCategory ? selectedCategory.slug : "Elige o crea una carpeta para empezar."}
                      </p>
                    </div>
                  </div>

                  <form className="mt-6 grid gap-4 rounded-lg border border-brand/10 bg-surface p-4 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={manejarSubirImagen}>
                    <label className="grid gap-2 text-sm font-semibold">
                      Imagen
                      <input
                        className="rounded-md border border-brand/16 bg-white px-3 py-2 font-normal outline-none file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-white"
                        type="file"
                        accept="image/*"
                        onChange={(event) => setImageForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-semibold">
                      Titulo
                      <input
                        className="rounded-md border border-brand/16 bg-white px-3 py-2 font-normal outline-none focus:border-brand"
                        value={imageForm.title}
                        onChange={(event) => setImageForm((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Dormitorio principal"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={saving || !selectedCategoryId}
                      className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-md border-0 bg-accent px-4 py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-60"
                    >
                      <Icono name="upload" className="h-4 w-4" />
                      Subir
                    </button>
                  </form>
                </section>

                <section className="rounded-lg border border-brand/12 bg-white p-5 shadow-[0_14px_34px_rgba(44,44,44,0.08)] sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="font-display text-3xl">Imagenes</h2>
                      <p className="mt-1 text-sm font-semibold text-muted">
                        {selectedImages.length} elementos en {selectedCategory?.nombre || "la carpeta seleccionada"}
                      </p>
                    </div>
                  </div>

                  {selectedCategory && selectedImages.length > 0 ? (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {selectedImages.map((image) => (
                        <figure key={image.id} className="group m-0 overflow-hidden rounded-lg border border-brand/10 bg-surface">
                          <div className="relative aspect-[4/3] overflow-hidden bg-copy/6">
                            <img
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              src={obtenerUrlImagenPublica(image.storage_path)}
                              alt={image.alt || image.titulo || ""}
                              loading="lazy"
                            />
                          </div>
                          <figcaption className="grid gap-1 p-4">
                            <span className="truncate text-sm font-bold">{image.titulo || image.nombre_archivo}</span>
                            <span className="truncate text-xs font-semibold text-muted">{image.nombre_archivo}</span>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-lg border border-dashed border-brand/24 bg-surface px-5 py-10 text-center">
                      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-white text-brand-dark">
                        <Icono name="image" className="h-6 w-6" />
                      </span>
                      <p className="mt-4 font-display text-2xl">{selectedCategory ? "Carpeta vacia" : "No hay carpeta seleccionada"}</p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                        {selectedCategory
                          ? "Sube la primera imagen para que aparezca en esta seccion."
                          : "Selecciona una carpeta del panel lateral o crea una nueva."}
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </section>
          </section>
        )}

        {vista === "configuracion" && (
          <section className="rounded-[2rem] border border-brand/10 bg-white p-6 shadow-[0_16px_48px_rgba(44,44,44,0.08)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-dark">Temporadas y precios</p>
                <h1 className="mt-3 font-display text-5xl text-copy">Gestion de tarifas activas</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                  Activa o desactiva temporadas segun la disponibilidad de la casa y el periodo del ano.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand/20 bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
                onClick={() => setMostrarModalTemporada(true)}
              >
                <Icono name="plus" className="h-4 w-4" />
                Nueva temporada
              </button>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <article className="rounded-[1.4rem] border border-brand/10 bg-surface p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Temporadas activas</p>
                <p className="mt-3 font-display text-4xl text-copy">{estadisticasTemporadas.activas}</p>
                <p className="mt-2 text-sm text-muted">Disponibles para el calculo de reservas.</p>
              </article>

              <article className="rounded-[1.4rem] border border-brand/10 bg-surface p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Temporadas inactivas</p>
                <p className="mt-3 font-display text-4xl text-copy">{estadisticasTemporadas.inactivas}</p>
                <p className="mt-2 text-sm text-muted">No se usan al calcular precios ahora mismo.</p>
              </article>

              <article className="rounded-[1.4rem] border border-brand/10 bg-surface p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Precio medio</p>
                <p className="mt-3 font-display text-4xl text-copy">{formatearMoneda(estadisticasTemporadas.precioMedio)}</p>
                <p className="mt-2 text-sm text-muted">Promedio general de todas las temporadas.</p>
              </article>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-brand/10 bg-white shadow-[0_14px_34px_rgba(44,44,44,0.06)]">
              <div className="border-b border-brand/10 px-5 py-4">
                <h2 className="font-display text-3xl text-copy">Lista de temporadas</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand/10">
                  <thead className="bg-surface text-left text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    <tr>
                      <th className="px-5 py-4">Temporada</th>
                      <th className="px-5 py-4">Periodo</th>
                      <th className="px-5 py-4">Precio</th>
                      <th className="px-5 py-4">Estado</th>
                      <th className="px-5 py-4">Accion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand/8 bg-white">
                    {temporadasOrdenadas.length > 0 ? (
                      temporadasOrdenadas.map((temporada) => (
                        <tr key={temporada.id} className="text-sm">
                          <td className="px-5 py-4">
                            <p className="font-bold text-copy">{temporada.nombre}</p>
                            <p className="mt-1 text-xs text-muted">ID {temporada.id}</p>
                          </td>
                          <td className="px-5 py-4 text-muted">{formatearPeriodoTemporada(temporada)}</td>
                          <td className="px-5 py-4 font-semibold text-copy">{formatearMoneda(temporada.precio)}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                                temporada.activo
                                  ? "bg-emerald-500/12 text-emerald-700"
                                  : "bg-zinc-500/10 text-zinc-600"
                              }`}
                            >
                              {temporada.activo ? "Activa" : "Inactiva"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full border border-brand/12 bg-surface px-3 py-2 text-xs font-bold text-copy transition hover:bg-brand/8"
                                onClick={() => abrirModalEditarTemporada(temporada)}
                              >
                                <Icono name="pencil" className="h-4 w-4" />
                                Editar
                              </button>
                            <button
                              type="button"
                              className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                                temporada.activo ? "bg-brand" : "bg-zinc-300"
                              }`}
                              aria-pressed={temporada.activo}
                              aria-label={`${temporada.activo ? "Desactivar" : "Activar"} ${temporada.nombre}`}
                              onClick={() => alternarEstadoTemporada(temporada)}
                              >
                                <span
                                  className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition ${
                                    temporada.activo ? "translate-x-7" : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-5 py-8 text-sm text-muted" colSpan={5}>
                          No hay temporadas configuradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {vista === "configuracion" && (
          <section id="gestion-usuarios" className="mt-8 rounded-[2rem] border border-brand/10 bg-white p-6 shadow-[0_16px_48px_rgba(44,44,44,0.08)] sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-dark">Gestion de usuarios</p>
                <h2 className="mt-3 font-display text-5xl text-copy">Usuarios</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                  Gestiona los accesos y perfiles del equipo y de los residentes registrados en la casa.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand/12 bg-surface px-5 py-3 text-sm font-bold text-copy transition hover:bg-brand/8"
                  onClick={abrirModalFiltroUsuarios}
                >
                  <span className="text-sm">⏷</span>
                  Filtrar
                </button>
              </div>
            </div>

            <div className="mt-7 overflow-hidden rounded-[1.6rem] border border-brand/10 bg-white shadow-[0_14px_34px_rgba(44,44,44,0.06)]">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand/10">
                  <thead className="bg-surface text-left text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    <tr>
                      <th className="px-5 py-4">Perfil de usuario</th>
                      <th className="px-5 py-4">Rol</th>
                      <th className="px-5 py-4">Contacto</th>
                      <th className="px-5 py-4">Estado</th>
                      <th className="px-5 py-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand/8 bg-white">
                    {usuariosVisibles.length > 0 ? (
                      usuariosVisibles.map((usuario) => {
                        const actividad = actividadUsuarios.get(usuario.id) || { reservas: 0, ultimaReserva: null };
                        const estadoUsuario = obtenerEstadoUsuario(actividad, usuario);

                        return (
                          <tr key={usuario.id} className="text-sm">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/12 font-display text-lg text-brand-dark">
                                  {obtenerInicialesUsuario(usuario.nombre, usuario.email)}
                                </div>
                                <div>
                                  <p className="font-bold text-copy">{usuario.nombre || "Sin nombre"}</p>
                                  <p className="mt-1 text-xs text-muted">{usuario.email || "Sin email"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                                  String(usuario.rol || "").toLowerCase().includes("admin")
                                    ? "bg-emerald-500/12 text-emerald-700"
                                    : "bg-brand/10 text-brand-dark"
                                }`}
                              >
                                {usuario.rol || "Cliente"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-muted">
                              <p>{usuario.email || "Sin contacto"}</p>
                              <p className="mt-1 text-xs text-muted">{usuario.telefono || "Sin telefono"}</p>
                              <p className="mt-1 text-xs text-muted">Alta {formatearFechaCorta(usuario.created_at)}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-2 text-sm font-semibold text-copy">
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${
                                    estadoUsuario === "Activo" ? "bg-emerald-500" : "bg-zinc-400"
                                  }`}
                                />
                                {estadoUsuario}
                              </span>
                              <p className="mt-1 text-xs text-muted">
                                {Number(actividad.reservas || 0) > 0
                                  ? `${actividad.reservas} reservas registradas`
                                  : "Sin actividad reciente"}
                              </p>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand/12 bg-surface text-copy transition hover:bg-brand/8"
                                  onClick={() => abrirModalEditarUsuario(usuario)}
                                  aria-label={`Editar ${usuario.nombre || "usuario"}`}
                                >
                                  <Icono name="pencil" className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-700/12 bg-red-700/6 text-red-800 transition hover:bg-red-700/12"
                                  onClick={() => manejarEliminarUsuario(usuario)}
                                  aria-label={`Eliminar ${usuario.nombre || "usuario"}`}
                                >
                                  <Icono name="trash" className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="px-5 py-8 text-sm text-muted" colSpan={5}>
                          No hay usuarios registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t border-brand/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">
                  Mostrando {usuariosVisibles.length} de {usuariosOrdenados.length} usuarios registrados
                </p>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-3">
                  <article className="rounded-2xl border border-brand/10 bg-surface px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Total admins</p>
                    <p className="mt-3 font-display text-3xl text-copy">{estadisticasUsuarios.admins}</p>
                  </article>
                  <article className="rounded-2xl border border-brand/10 bg-surface px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Clientes activos</p>
                    <p className="mt-3 font-display text-3xl text-copy">{estadisticasUsuarios.clientesActivos}</p>
                  </article>
                  <article className="rounded-2xl border border-brand/10 bg-surface px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Pendientes</p>
                    <p className="mt-3 font-display text-3xl text-copy">{estadisticasUsuarios.pendientes}</p>
                  </article>
                </div>
              </div>
            </div>
          </section>
        )}

        {vista === "configuracion" && (
          <section id="servicios-extra" className="mt-8 rounded-[2rem] border border-brand/10 bg-white p-6 shadow-[0_16px_48px_rgba(44,44,44,0.08)] sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-dark">Servicios extra</p>
                <h2 className="mt-3 font-display text-5xl text-copy">Extra Services</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                  Gestiona la disponibilidad, el precio y el estado activo de todos los servicios complementarios.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand/20 bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
                onClick={abrirModalNuevoExtra}
              >
                <Icono name="plus" className="h-4 w-4" />
                Nuevo servicio
              </button>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <article className="rounded-[1.4rem] border border-brand/10 bg-surface p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Servicios activos</p>
                <p className="mt-3 font-display text-4xl text-copy">{estadisticasExtras.activos}</p>
                <p className="mt-2 text-sm text-muted">Disponibles para que los clientes los añadan.</p>
              </article>

              <article className="rounded-[1.4rem] border border-brand/10 bg-surface p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Precio medio</p>
                <p className="mt-3 font-display text-4xl text-copy">{formatearMoneda(estadisticasExtras.precioMedio)}</p>
                <p className="mt-2 text-sm text-muted">Media general de todos los servicios registrados.</p>
              </article>

              <article className="rounded-[1.4rem] border border-brand/10 bg-surface p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Ingresos potenciales</p>
                <p className="mt-3 font-display text-4xl text-copy">{formatearMoneda(estadisticasExtras.ingresosPotenciales)}</p>
                <p className="mt-2 text-sm text-muted">Suma de los importes de los servicios activos.</p>
              </article>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-brand/10 bg-white shadow-[0_14px_34px_rgba(44,44,44,0.06)]">
              <div className="border-b border-brand/10 px-5 py-4">
                <h3 className="font-display text-3xl text-copy">Lista de servicios</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand/10">
                  <thead className="bg-surface text-left text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    <tr>
                      <th className="px-5 py-4">Service Details</th>
                      <th className="px-5 py-4">Price</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand/8 bg-white">
                    {extrasOrdenados.length > 0 ? (
                      extrasOrdenados.map((extra) => (
                        <tr key={extra.id} className="text-sm">
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/12 text-brand-dark">
                                <Icono name="ticket" className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-copy">{extra.nombre}</p>
                                <p className="mt-1 max-w-xl text-xs leading-5 text-muted">
                                  {extra.descripcion || "Servicio complementario disponible para la reserva."}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-copy">{formatearMoneda(extra.precio)}</p>
                            <p className="mt-1 text-xs text-muted">por servicio</p>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                                extra.activo ? "bg-brand" : "bg-zinc-300"
                              }`}
                              aria-pressed={extra.activo}
                              aria-label={`${extra.activo ? "Desactivar" : "Activar"} ${extra.nombre}`}
                              onClick={() => alternarEstadoExtra(extra)}
                            >
                              <span
                                className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition ${
                                  extra.activo ? "translate-x-7" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand/12 bg-surface text-copy transition hover:bg-brand/8"
                                onClick={() => abrirModalEditarExtra(extra)}
                                aria-label={`Editar ${extra.nombre}`}
                              >
                                <Icono name="pencil" className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-700/12 bg-red-700/6 text-red-800 transition hover:bg-red-700/12"
                                onClick={() => manejarEliminarExtra(extra)}
                                aria-label={`Eliminar ${extra.nombre}`}
                              >
                                <Icono name="trash" className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-5 py-8 text-sm text-muted" colSpan={4}>
                          No hay servicios extra configurados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {vista === "configuracion" && mostrarModalTemporada && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8" onClick={() => setMostrarModalTemporada(false)}>
            <section
              className="w-full max-w-3xl rounded-[1.8rem] border border-brand/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    {temporadaEnEdicion ? "Editar temporada" : "Alta de temporada"}
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-copy">
                    {temporadaEnEdicion ? "Editar temporada" : "Crear nueva temporada"}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    Define un nombre, los meses de vigencia, el precio y si quieres dejarla activa desde el inicio.
                  </p>
                </div>

                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand/12 bg-surface text-brand-dark transition hover:bg-brand/10"
                  onClick={cerrarModalTemporada}
                  aria-label="Cerrar modal"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>

              <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={manejarCrearTemporada}>
                <label className="grid gap-2 text-sm font-semibold text-copy md:col-span-2">
                  Nombre de la temporada
                  <input
                    name="nombre"
                    value={nuevaTemporada.nombre}
                    onChange={manejarCambioNuevaTemporada}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                    placeholder="Verano 2026"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Mes de inicio
                  <select
                    name="mes_inicio"
                    value={nuevaTemporada.mes_inicio}
                    onChange={manejarCambioNuevaTemporada}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                  >
                    {MESES_TEMPORADA.map((mes) => (
                      <option key={mes.valor} value={mes.valor}>
                        {mes.etiqueta}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Mes de fin
                  <select
                    name="mes_fin"
                    value={nuevaTemporada.mes_fin}
                    onChange={manejarCambioNuevaTemporada}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                  >
                    {MESES_TEMPORADA.map((mes) => (
                      <option key={mes.valor} value={mes.valor}>
                        {mes.etiqueta}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Precio
                  <input
                    name="precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={nuevaTemporada.precio}
                    onChange={manejarCambioNuevaTemporada}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                    placeholder="150"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-brand/12 bg-white px-4 py-3 text-sm font-semibold text-copy">
                  <input
                    name="activo"
                    type="checkbox"
                    checked={nuevaTemporada.activo}
                    onChange={manejarCambioNuevaTemporada}
                    className="h-4 w-4 rounded border-brand/30 text-brand focus:ring-brand"
                  />
                  Crear la temporada ya activa
                </label>

                <div className="flex items-end gap-3 md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-brand/20 bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
                  >
                    <Icono name={temporadaEnEdicion ? "pencil" : "plus"} className="h-4 w-4" />
                    {temporadaEnEdicion ? "Guardar cambios" : "Crear temporada"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand/12 bg-surface px-5 py-3 text-sm font-bold text-copy transition hover:bg-brand/8"
                    onClick={cerrarModalTemporada}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {vista === "configuracion" && mostrarModalExtra && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8" onClick={cerrarModalExtra}>
            <section
              className="w-full max-w-2xl rounded-[1.8rem] border border-brand/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    {extraEnEdicion ? "Editar servicio" : "Nuevo servicio"}
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-copy">
                    {extraEnEdicion ? "Modificar extra" : "Crear servicio extra"}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                    Define el nombre, una descripción breve, el precio y si el servicio quedará activo desde el inicio.
                  </p>
                </div>

                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand/12 bg-surface text-brand-dark transition hover:bg-brand/10"
                  onClick={cerrarModalExtra}
                  aria-label="Cerrar modal de servicio"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>

              <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={manejarGuardarExtra}>
                <label className="grid gap-2 text-sm font-semibold text-copy md:col-span-2">
                  Nombre del servicio
                  <input
                    name="nombre"
                    value={formExtra.nombre}
                    onChange={manejarCambioExtra}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                    placeholder="Desayuno rural"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy md:col-span-2">
                  Descripcion
                  <textarea
                    name="descripcion"
                    rows="4"
                    value={formExtra.descripcion}
                    onChange={manejarCambioExtra}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                    placeholder="Una breve descripcion del servicio..."
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Precio
                  <input
                    name="precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formExtra.precio}
                    onChange={manejarCambioExtra}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                    placeholder="25"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-brand/12 bg-white px-4 py-3 text-sm font-semibold text-copy">
                  <input
                    name="activo"
                    type="checkbox"
                    checked={formExtra.activo}
                    onChange={manejarCambioExtra}
                    className="h-4 w-4 rounded border-brand/30 text-brand focus:ring-brand"
                  />
                  Servicio activo
                </label>

                <div className="flex items-end gap-3 md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-brand/20 bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
                  >
                    <Icono name={extraEnEdicion ? "pencil" : "plus"} className="h-4 w-4" />
                    {extraEnEdicion ? "Guardar cambios" : "Crear servicio"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand/12 bg-surface px-5 py-3 text-sm font-bold text-copy transition hover:bg-brand/8"
                    onClick={cerrarModalExtra}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {vista === "configuracion" && mostrarModalFiltroUsuarios && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8" onClick={cerrarModalFiltroUsuarios}>
            <section
              className="w-full max-w-2xl rounded-[1.8rem] border border-brand/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Filtrar usuarios</p>
                  <h2 className="mt-2 font-display text-3xl text-copy">Ajustar listado</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                    Busca por nombre, limita por rol o muestra solo usuarios con actividad reciente.
                  </p>
                </div>

                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand/12 bg-surface text-brand-dark transition hover:bg-brand/10"
                  onClick={cerrarModalFiltroUsuarios}
                  aria-label="Cerrar modal de filtros"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>

              <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
                <label className="grid gap-2 text-sm font-semibold text-copy md:col-span-2">
                  Buscar
                  <input
                    name="busqueda"
                    value={filtroUsuarios.busqueda}
                    onChange={manejarCambioFiltroUsuarios}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                    placeholder="Nombre, email o rol"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Rol
                  <select
                    name="rol"
                    value={filtroUsuarios.rol}
                    onChange={manejarCambioFiltroUsuarios}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                  >
                    <option value="todos">Todos</option>
                    <option value="admin">Admin</option>
                    <option value="cliente">Cliente</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Estado
                  <select
                    name="estado"
                    value={filtroUsuarios.estado}
                    onChange={manejarCambioFiltroUsuarios}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                  >
                    <option value="todos">Todos</option>
                    <option value="activo">Activo</option>
                    <option value="offline">Offline</option>
                  </select>
                </label>

                <div className="flex items-end gap-3 md:col-span-2">
                  <button
                    type="button"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand/20 bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
                    onClick={cerrarModalFiltroUsuarios}
                  >
                    Aplicar filtros
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand/12 bg-surface px-5 py-3 text-sm font-bold text-copy transition hover:bg-brand/8"
                    onClick={limpiarFiltrosUsuarios}
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {vista === "configuracion" && mostrarModalUsuario && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8" onClick={cerrarModalUsuario}>
            <section
              className="w-full max-w-2xl rounded-[1.8rem] border border-brand/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    {usuarioEnEdicion ? "Editar usuario" : "Invitar usuario"}
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-copy">
                    {usuarioEnEdicion ? "Modificar perfil" : "Crear perfil de usuario"}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                    Guarda el nombre, el email y el rol del usuario para que aparezca en el panel de gestión.
                  </p>
                </div>

                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand/12 bg-surface text-brand-dark transition hover:bg-brand/10"
                  onClick={cerrarModalUsuario}
                  aria-label="Cerrar modal de usuario"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>

              <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={manejarGuardarUsuario}>
                <label className="grid gap-2 text-sm font-semibold text-copy md:col-span-2">
                  Nombre completo
                  <input
                    name="nombre"
                    value={formUsuario.nombre}
                    onChange={manejarCambioUsuario}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                    placeholder="Nombre y apellidos"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy md:col-span-2">
                  Email
                  <input
                    name="email"
                    type="email"
                    value={formUsuario.email}
                    onChange={manejarCambioUsuario}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                    placeholder="usuario@correo.com"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Telefono
                  <input
                    name="telefono"
                    value={formUsuario.telefono}
                    onChange={manejarCambioUsuario}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                    placeholder="+34 600 000 000"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Rol
                  <select
                    name="rol"
                    value={formUsuario.rol}
                    onChange={manejarCambioUsuario}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <div className="flex items-end gap-3 md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-brand/20 bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
                  >
                    <Icono name={usuarioEnEdicion ? "pencil" : "users"} className="h-4 w-4" />
                    {usuarioEnEdicion ? "Guardar cambios" : "Enviar invitacion"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand/12 bg-surface px-5 py-3 text-sm font-bold text-copy transition hover:bg-brand/8"
                    onClick={cerrarModalUsuario}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {vista === "reservas" && mostrarModalReserva && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8" onClick={cerrarModalReserva}>
            <section
              className="w-full max-w-4xl rounded-[1.8rem] border border-brand/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    {reservaEnEdicion ? "Editar reserva" : "Nueva reserva"}
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-copy">
                    {reservaEnEdicion ? "Modificar reserva" : "Crear reserva"}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    Ajusta los datos principales de la reserva antes de volver a guardarla en el panel.
                  </p>
                </div>

                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand/12 bg-surface text-brand-dark transition hover:bg-brand/10"
                  onClick={cerrarModalReserva}
                  aria-label="Cerrar modal de reserva"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>

              <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={manejarGuardarReserva}>
                <label className="grid gap-2 text-sm font-semibold text-copy md:col-span-2">
                  Nombre del cliente
                  <input
                    name="nombre_cliente"
                    value={formReserva.nombre_cliente}
                    onChange={manejarCambioReserva}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                    placeholder="Nombre y apellidos"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Email
                  <input
                    name="email_cliente"
                    type="email"
                    value={formReserva.email_cliente}
                    onChange={manejarCambioReserva}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                    placeholder="cliente@correo.com"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Telefono
                  <input
                    name="telefono_cliente"
                    value={formReserva.telefono_cliente}
                    onChange={manejarCambioReserva}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                    placeholder="+34 600 000 000"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Fecha de entrada
                  <input
                    name="fecha_entrada"
                    type="date"
                    value={formReserva.fecha_entrada}
                    onChange={manejarCambioReserva}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Fecha de salida
                  <input
                    name="fecha_salida"
                    type="date"
                    value={formReserva.fecha_salida}
                    onChange={manejarCambioReserva}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Numero de personas
                  <input
                    name="numero_personas"
                    type="number"
                    min="1"
                    step="1"
                    value={formReserva.numero_personas}
                    onChange={manejarCambioReserva}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Precio alojamiento
                  <input
                    name="precio_alojamiento"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formReserva.precio_alojamiento}
                    onChange={manejarCambioReserva}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy">
                  Precio extras
                  <input
                    name="precio_extras"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formReserva.precio_extras}
                    onChange={manejarCambioReserva}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-copy md:col-span-2">
                  Precio total
                  <input
                    name="precio_total"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formReserva.precio_total}
                    onChange={manejarCambioReserva}
                    className="rounded-xl border border-brand/12 bg-white px-4 py-3 font-normal outline-none transition focus:border-brand"
                  />
                </label>

                <div className="flex items-end gap-3 md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-brand/20 bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
                  >
                    <Icono name={reservaEnEdicion ? "pencil" : "plus"} className="h-4 w-4" />
                    {reservaEnEdicion ? "Guardar cambios" : "Guardar reserva"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand/12 bg-surface px-5 py-3 text-sm font-bold text-copy transition hover:bg-brand/8"
                    onClick={cerrarModalReserva}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
      <PiePagina />
    </div>
  );
}
