import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import BarraNavegacion from "../components/NavBar";
import PiePagina from "../layouts/Footer";
import { supabase } from "../supabase/client";
import { mostrarAlertaApp } from "../utils/appAlert";

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

function formatearMoneda(valor, decimales = 2) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(Number(valor || 0));
}

function formatearTextoPdf(valor) {
  return String(valor ?? "").trim() || "--";
}

function calcularNoches(reserva) {
  const entrada = new Date(reserva.fecha_entrada);
  const salida = new Date(reserva.fecha_salida);

  if (Number.isNaN(entrada.getTime()) || Number.isNaN(salida.getTime())) {
    return 0;
  }

  return Math.max(0, Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24)));
}

function obtenerExtrasReserva(reserva) {
  return Array.isArray(reserva.reservas_extras) ? reserva.reservas_extras : [];
}

function dibujarTextoDerecha(doc, texto, x, y) {
  const ancho = doc.getTextWidth(texto);
  doc.text(texto, x - ancho, y);
}

function generarFacturaReserva(reserva) {
  if (!reserva) return;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const total = Number(reserva.precio_total || 0);
  const baseImponible = total / 1.1;
  const iva = total - baseImponible;
  const numeroFactura = `LG-${String(reserva.id || "000000").slice(0, 8).toUpperCase()}`;
  const fechaFactura = obtenerFechaLegible(new Date());
  const noches = calcularNoches(reserva);
  const extras = obtenerExtrasReserva(reserva);

  doc.setFillColor(44, 44, 44);
  doc.rect(0, 0, 210, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("FACTURA", 14, 18);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Casa Rural La Galana", 14, 27);

  doc.setFont("helvetica", "bold");
  dibujarTextoDerecha(doc, numeroFactura, 196, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  dibujarTextoDerecha(doc, `Fecha: ${fechaFactura}`, 196, 24);

  doc.setTextColor(44, 44, 44);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Emisor", 14, 50);
  doc.text("Cliente", 112, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Casa Rural La Galana", 14, 57);
  doc.text("Alojamiento rural", 14, 63);
  doc.text("España", 14, 69);

  doc.text(formatearTextoPdf(reserva.nombre_cliente), 112, 57);
  doc.text(formatearTextoPdf(reserva.email_cliente), 112, 63);
  doc.text(formatearTextoPdf(reserva.telefono_cliente), 112, 69);

  doc.setDrawColor(216, 205, 187);
  doc.roundedRect(14, 82, 182, 28, 3, 3);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de estancia", 20, 92);
  doc.setFont("helvetica", "normal");
  doc.text(`Entrada: ${obtenerFechaLegible(reserva.fecha_entrada)}`, 20, 101);
  doc.text(`Salida: ${obtenerFechaLegible(reserva.fecha_salida)}`, 82, 101);
  doc.text(`Noches: ${noches}`, 144, 101);

  let y = 126;
  doc.setFillColor(248, 247, 243);
  doc.rect(14, y - 8, 182, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Concepto", 18, y - 1);
  doc.text("Cantidad", 118, y - 1);
  doc.text("Precio", 146, y - 1);
  dibujarTextoDerecha(doc, "Importe", 192, y - 1);

  y += 10;
  doc.setFont("helvetica", "normal");

  const lineas = [
    {
      concepto: "Alojamiento",
      cantidad: noches > 0 ? `${noches} noche${noches === 1 ? "" : "s"}` : "1 estancia",
      precio: Number(reserva.precio_alojamiento || 0),
      importe: Number(reserva.precio_alojamiento || 0),
    },
    ...extras.map((extra) => {
      const cantidad = Number(extra.cantidad || 1);
      const precio = Number(extra.precio_unitario || 0);
      return {
        concepto: extra.extras?.nombre || "Servicio extra",
        cantidad: String(cantidad),
        precio,
        importe: cantidad * precio,
      };
    }),
  ];

  if (Number(reserva.precio_extras || 0) > 0 && extras.length === 0) {
    lineas.push({
      concepto: "Servicios extra",
      cantidad: "1",
      precio: Number(reserva.precio_extras || 0),
      importe: Number(reserva.precio_extras || 0),
    });
  }

  lineas.forEach((linea) => {
    doc.text(formatearTextoPdf(linea.concepto).slice(0, 48), 18, y);
    doc.text(linea.cantidad, 118, y);
    doc.text(formatearMoneda(linea.precio), 146, y);
    dibujarTextoDerecha(doc, formatearMoneda(linea.importe), 192, y);
    y += 9;
  });

  doc.setDrawColor(216, 205, 187);
  doc.line(14, y, 196, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  dibujarTextoDerecha(doc, "Base imponible", 158, y);
  dibujarTextoDerecha(doc, formatearMoneda(baseImponible), 192, y);
  y += 8;
  dibujarTextoDerecha(doc, "IVA 10%", 158, y);
  dibujarTextoDerecha(doc, formatearMoneda(iva), 192, y);
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  dibujarTextoDerecha(doc, "Total factura", 158, y);
  dibujarTextoDerecha(doc, formatearMoneda(total), 192, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 107, 107);
  doc.text("Documento generado automáticamente desde el área de cliente.", 14, 270);
  doc.text("Gracias por confiar en Casa Rural La Galana.", 14, 276);

  const url = doc.output("bloburl");
  const ventana = window.open(url, "_blank", "noopener,noreferrer");
  if (ventana) {
    ventana.focus();
  } else {
    doc.save(`factura-${numeroFactura}.pdf`);
  }
}

export default function PaginaMisReservas() {
  const [usuario, setUsuario] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarReservas() {
      setCargando(true);

      if (!supabase) {
        setUsuario(null);
        setReservas([]);
        setCargando(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      const user = authData?.user ?? null;
      setUsuario(user);

      if (authError || !user) {
        setReservas([]);
        setCargando(false);
        return;
      }

      const selectConExtras =
        "id, usuario_id, nombre_cliente, email_cliente, telefono_cliente, numero_personas, created_at, fecha_entrada, fecha_salida, precio_alojamiento, precio_extras, precio_total, reservas_extras(id, cantidad, precio_unitario, extras(nombre, descripcion))";

      let { data, error } = await supabase
        .from("reservas")
        .select(selectConExtras)
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        const respuestaSimple = await supabase
          .from("reservas")
          .select(
            "id, usuario_id, nombre_cliente, email_cliente, telefono_cliente, numero_personas, created_at, fecha_entrada, fecha_salida, precio_alojamiento, precio_extras, precio_total",
          )
          .eq("usuario_id", user.id)
          .order("created_at", { ascending: false });

        data = respuestaSimple.data;
        error = respuestaSimple.error;
      }

      if (error) {
        mostrarAlertaApp({
          title: "No se pudieron cargar tus reservas",
          message: error.message,
          variant: "warning",
        });
      }

      setReservas(data ?? []);
      setCargando(false);
    }

    cargarReservas();
  }, []);

  const totales = useMemo(
    () => ({
      reservas: reservas.length,
      noches: reservas.reduce((total, reserva) => total + calcularNoches(reserva), 0),
      importe: reservas.reduce((total, reserva) => total + Number(reserva.precio_total || 0), 0),
    }),
    [reservas],
  );

  return (
    <div className="min-h-screen bg-surface text-copy">
      <BarraNavegacion />

      <main className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[1680px] flex-col px-4 pt-30 pb-16 sm:px-6 lg:px-10">
        <section className="grid flex-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0 rounded-lg border border-brand/10 bg-white p-5 shadow-[0_18px_48px_rgba(44,44,44,0.08)] sm:p-8">
            <div className="flex flex-col gap-5 border-b border-brand/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-dark">Área de cliente</p>
                <h1 className="mt-2 font-display text-4xl leading-tight text-copy sm:text-5xl">Mis reservas</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                  Consulta tus estancias registradas y genera la factura de cada reserva.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:hidden">
              {cargando ? (
                <div className="rounded-[1.1rem] border border-brand/10 bg-surface px-5 py-10 text-center text-sm font-semibold text-muted">
                  Cargando tus reservas...
                </div>
              ) : usuario ? (
                reservas.length > 0 ? (
                  reservas.map((reserva) => (
                    <article key={reserva.id} className="rounded-[1.1rem] border border-brand/10 bg-surface p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-copy">{reserva.nombre_cliente || "Sin nombre"}</p>
                          <p className="mt-1 truncate text-xs font-semibold text-muted">#{String(reserva.id).slice(0, 8)}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-dark">
                          {reserva.numero_personas || 0} pers.
                        </span>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-md bg-white/75 p-3">
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Fechas</dt>
                          <dd className="mt-1 font-semibold text-copy">
                            {obtenerFechaLegible(reserva.fecha_entrada)} - {obtenerFechaLegible(reserva.fecha_salida)}
                          </dd>
                        </div>
                        <div className="rounded-md bg-white/75 p-3">
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Total</dt>
                          <dd className="mt-1 font-semibold text-copy">{formatearMoneda(reserva.precio_total, 0)}</dd>
                        </div>
                      </dl>

                      <button
                        type="button"
                        className="mt-4 inline-flex min-h-[42px] w-full items-center justify-center rounded-md border border-brand/20 bg-brand/8 px-3 py-2 text-xs font-bold text-brand-dark transition hover:bg-brand/14"
                        onClick={() => generarFacturaReserva(reserva)}
                      >
                        Imprimir factura
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[1.1rem] border border-dashed border-brand/24 bg-surface px-5 py-10 text-center text-sm font-semibold text-muted">
                    Todavía no tienes reservas registradas con esta cuenta.
                  </div>
                )
              ) : (
                <div className="rounded-[1.1rem] border border-dashed border-brand/24 bg-surface px-5 py-10 text-center text-sm font-semibold text-muted">
                  Inicia sesión para ver tus reservas.
                </div>
              )}
            </div>

            <div className="mt-6 hidden overflow-x-auto rounded-lg border border-brand/10 md:block">
              <table className="w-full min-w-[920px] table-fixed divide-y divide-brand/10">
                <thead className="bg-[#f7f3ea] text-left text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="w-[30%] px-5 py-4">Reserva</th>
                    <th className="w-[25%] px-5 py-4">Fechas</th>
                    <th className="w-[15%] px-5 py-4">Personas</th>
                    <th className="w-[14%] px-5 py-4">Total</th>
                    <th className="w-[16%] px-5 py-4 text-right">Factura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand/8 bg-white">
                  {cargando ? (
                    <tr>
                      <td className="px-5 py-10 text-sm text-muted" colSpan={5}>
                        Cargando tus reservas...
                      </td>
                    </tr>
                  ) : usuario ? (
                    reservas.length > 0 ? (
                      reservas.map((reserva) => (
                        <tr key={reserva.id} className="text-sm transition hover:bg-surface/70">
                          <td className="px-5 py-5">
                            <p className="truncate font-bold text-copy">{reserva.nombre_cliente || "Sin nombre"}</p>
                            <p className="mt-1 text-xs font-semibold text-muted">#{String(reserva.id).slice(0, 8)}</p>
                          </td>
                          <td className="px-5 py-5 font-semibold text-muted">
                            <span className="block truncate">
                            {obtenerFechaLegible(reserva.fecha_entrada)} - {obtenerFechaLegible(reserva.fecha_salida)}
                            </span>
                          </td>
                          <td className="px-5 py-5">
                            <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-dark">
                              {reserva.numero_personas || 0} pers.
                            </span>
                          </td>
                          <td className="px-5 py-5 font-bold text-copy">{formatearMoneda(reserva.precio_total, 0)}</td>
                          <td className="px-5 py-5 text-right">
                            <button
                              type="button"
                              className="inline-flex min-h-[38px] max-w-full items-center justify-center rounded-md border border-brand/20 bg-brand/8 px-4 py-2 text-xs font-bold text-brand-dark transition hover:bg-brand/14"
                              onClick={() => generarFacturaReserva(reserva)}
                            >
                              Imprimir factura
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-5 py-10 text-sm text-muted" colSpan={5}>
                          Todavía no tienes reservas registradas con esta cuenta.
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td className="px-5 py-10 text-sm text-muted" colSpan={5}>
                        Inicia sesión para ver tus reservas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="rounded-lg border border-brand/10 bg-[linear-gradient(135deg,#f7f3ea_0%,#efe3cd_100%)] p-5 shadow-[0_18px_48px_rgba(44,44,44,0.08)] xl:sticky xl:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-dark">Resumen rápido</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-md bg-white/80 p-4 shadow-[inset_0_0_0_1px_rgba(194,168,120,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Reservas</p>
                <p className="mt-1 font-display text-3xl text-copy">{totales.reservas}</p>
              </div>
              <div className="rounded-md bg-white/80 p-4 shadow-[inset_0_0_0_1px_rgba(194,168,120,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Noches</p>
                <p className="mt-1 font-display text-3xl text-copy">{totales.noches}</p>
              </div>
              <div className="rounded-md bg-white/80 p-4 shadow-[inset_0_0_0_1px_rgba(194,168,120,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Total facturado</p>
                <p className="mt-1 font-display text-3xl text-copy">{formatearMoneda(totales.importe, 0)}</p>
              </div>
            </div>

            {!usuario && (
              <a
                href="/login"
                className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-brand/20 bg-brand px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-brand-dark"
              >
                Iniciar sesión
              </a>
            )}
          </aside>
        </section>
      </main>

      <PiePagina />
    </div>
  );
}
