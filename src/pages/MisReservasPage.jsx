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
  doc.text("Espana", 14, 69);

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
  doc.text("Documento generado automaticamente desde el area de cliente.", 14, 270);
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

      const filtroEmail = user.email ? `,email_cliente.eq.${user.email}` : "";
      const selectConExtras =
        "id, usuario_id, nombre_cliente, email_cliente, telefono_cliente, numero_personas, created_at, fecha_entrada, fecha_salida, precio_alojamiento, precio_extras, precio_total, reservas_extras(id, cantidad, precio_unitario, extras(nombre, descripcion))";

      let { data, error } = await supabase
        .from("reservas")
        .select(selectConExtras)
        .or(`usuario_id.eq.${user.id}${filtroEmail}`)
        .order("created_at", { ascending: false });

      if (error) {
        const respuestaSimple = await supabase
          .from("reservas")
          .select(
            "id, usuario_id, nombre_cliente, email_cliente, telefono_cliente, numero_personas, created_at, fecha_entrada, fecha_salida, precio_alojamiento, precio_extras, precio_total",
          )
          .or(`usuario_id.eq.${user.id}${filtroEmail}`)
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

      <main className="mx-auto max-w-[1500px] px-6 pt-28 pb-20 sm:px-10">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <article className="rounded-[1.7rem] border border-brand/10 bg-white p-6 shadow-[0_14px_34px_rgba(44,44,44,0.06)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-dark">Area de cliente</p>
                <h1 className="mt-2 font-display text-4xl text-copy">Mis reservas</h1>
              </div>
              <a href="/#reserva" className="text-sm font-bold text-brand-dark no-underline">
                Nueva reserva
              </a>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.2rem] border border-brand/8">
              <table className="min-w-full divide-y divide-brand/10">
                <thead className="bg-surface text-left text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Reserva</th>
                    <th className="px-4 py-3">Fechas</th>
                    <th className="px-4 py-3">Personas</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Factura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand/8 bg-white">
                  {cargando ? (
                    <tr>
                      <td className="px-4 py-8 text-sm text-muted" colSpan={5}>
                        Cargando tus reservas...
                      </td>
                    </tr>
                  ) : usuario ? (
                    reservas.length > 0 ? (
                      reservas.map((reserva) => (
                        <tr key={reserva.id} className="text-sm">
                          <td className="px-4 py-4">
                            <p className="font-bold text-copy">{reserva.nombre_cliente || "Sin nombre"}</p>
                            <p className="mt-1 text-xs text-muted">#{String(reserva.id).slice(0, 8)}</p>
                          </td>
                          <td className="px-4 py-4 text-muted">
                            {obtenerFechaLegible(reserva.fecha_entrada)} - {obtenerFechaLegible(reserva.fecha_salida)}
                          </td>
                          <td className="px-4 py-4 font-semibold text-copy">{reserva.numero_personas || 0}</td>
                          <td className="px-4 py-4 font-semibold text-copy">{formatearMoneda(reserva.precio_total, 0)}</td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-md border border-brand/20 bg-brand/8 px-3 py-2 text-xs font-bold text-brand-dark transition hover:bg-brand/14"
                              onClick={() => generarFacturaReserva(reserva)}
                            >
                              Imprimir factura
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-8 text-sm text-muted" colSpan={5}>
                          Todavia no tienes reservas registradas con esta cuenta.
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-sm text-muted" colSpan={5}>
                        Inicia sesion para ver tus reservas.
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
                <p className="mt-1 font-display text-3xl text-copy">{totales.reservas}</p>
              </div>
              <div className="rounded-[1.1rem] bg-white/75 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Noches</p>
                <p className="mt-1 font-display text-3xl text-copy">{totales.noches}</p>
              </div>
              <div className="rounded-[1.1rem] bg-white/75 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Total facturado</p>
                <p className="mt-1 font-display text-3xl text-copy">{formatearMoneda(totales.importe, 0)}</p>
              </div>
            </div>

            {!usuario && (
              <a
                href="/login"
                className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-brand/20 bg-brand px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-brand-dark"
              >
                Iniciar sesion
              </a>
            )}
          </aside>
        </section>
      </main>

      <PiePagina />
    </div>
  );
}
