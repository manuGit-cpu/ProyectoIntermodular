import { useEffect, useState } from "react";
import MostrarCalendario from "./Calendar";
import { mostrarAlertaApp } from "../utils/appAlert";
import { supabase } from "../supabase/client";

function Reserva() {
  const [selectedDates, setSelectedDates] = useState([null, null]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: "2",
    observations: "",
  });
  const [extrasDisponibles, setExtrasDisponibles] = useState([]);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([]);
  const [modalExtrasAbierto, setModalExtrasAbierto] = useState(false);
  const [cargandoExtras, setCargandoExtras] = useState(false);
  const [guardandoReserva, setGuardandoReserva] = useState(false);
  const [recargaCalendario, setRecargaCalendario] = useState(0);

  useEffect(() => {
    const obtenerExtras = async () => {
      if (!supabase) return;

      setCargandoExtras(true);

      const { data, error } = await supabase
        .from("extras")
        .select("id, nombre, descripcion, precio")
        .eq("activo", true)
        .order("nombre");

      if (error) {
        console.error("Error al obtener extras:", error);
        mostrarAlertaApp({
          title: "No se han podido cargar los extras",
          message:
            "Inténtalo de nuevo más tarde o continúa con la reserva sin extras.",
          variant: "warning",
        });
      } else {
        setExtrasDisponibles(data ?? []);
      }

      setCargandoExtras(false);
    };

    obtenerExtras();
  }, []);

  useEffect(() => {
    if (!modalExtrasAbierto) return undefined;

    const manejarTeclaPulsada = (event) => {
      if (event.key === "Escape") {
        setModalExtrasAbierto(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", manejarTeclaPulsada);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", manejarTeclaPulsada);
    };
  }, [modalExtrasAbierto]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatearFecha = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const manejarCambioCalendario = (value) => {
    if (Array.isArray(value)) {
      setSelectedDates(value);
    } else {
      setSelectedDates([value, null]);
    }
  };

  const formatearImporte = (cantidad) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(Number(cantidad || 0));

  const formatearFechaSql = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const sumarDias = (date, dias) => {
    const nuevaFecha = new Date(date);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    return nuevaFecha;
  };

  const calcularNoches = (fechaEntrada, fechaSalida) =>
    Math.ceil((fechaSalida - fechaEntrada) / (1000 * 60 * 60 * 24));

  const mesEstaEnTemporada = (mes, temporada) => {
    const mesInicio = Number(temporada.mes_inicio);
    const mesFin = Number(temporada.mes_fin);

    if (!Number.isInteger(mesInicio) || !Number.isInteger(mesFin)) {
      return false;
    }

    if (mesInicio <= mesFin) {
      return mes >= mesInicio && mes <= mesFin;
    }

    return mes >= mesInicio || mes <= mesFin;
  };

  const calcularPrecioAlojamiento = async (fechaEntrada, fechaSalida) => {
    const { data: temporadas, error } = await supabase
      .from("temporadas_precios")
      .select("nombre, mes_inicio, mes_fin, precio")
      .eq("activo", true)
      .order("mes_inicio", { ascending: true });

    if (error) throw error;

    const noches = calcularNoches(fechaEntrada, fechaSalida);
    let total = 0;

    for (let indice = 0; indice < noches; indice += 1) {
      const fechaNoche = sumarDias(fechaEntrada, indice);
      const mesNoche = fechaNoche.getMonth() + 1;
      const temporada = temporadas?.find(
        (item) => mesEstaEnTemporada(mesNoche, item),
      );

      if (!temporada) {
        throw new Error(
          `No hay precio configurado para ${formatearFecha(fechaNoche)}.`,
        );
      }

      const precioNoche = Number(temporada.precio);

      if (!Number.isFinite(precioNoche) || precioNoche <= 0) {
        throw new Error(
          `El precio de "${temporada.nombre}" no está configurado correctamente.`,
        );
      }

      total += precioNoche;
    }

    return total;
  };

  const abrirModalExtras = () => {
    setModalExtrasAbierto(true);
  };

  const cerrarModalExtras = () => {
    setModalExtrasAbierto(false);
  };

  const obtenerExtraSeleccionado = (extraId) =>
    extrasSeleccionados.find((extra) => extra.id === extraId);

  const alternarExtra = (extra) => {
    setExtrasSeleccionados((prev) => {
      const yaSeleccionado = prev.some((item) => item.id === extra.id);

      if (yaSeleccionado) {
        return prev.filter((item) => item.id !== extra.id);
      }

      return [
        ...prev,
        {
          id: extra.id,
          nombre: extra.nombre,
          precio: Number(extra.precio || 0),
          cantidad: 1,
        },
      ];
    });
  };

  const actualizarCantidadExtra = (extraId, incremento) => {
    setExtrasSeleccionados((prev) =>
      prev
        .map((extra) =>
          extra.id === extraId
            ? { ...extra, cantidad: Math.max(1, extra.cantidad + incremento) }
            : extra,
        )
        .filter(Boolean),
    );
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!supabase) {
      mostrarAlertaApp({
        title: "Supabase no está configurado",
        message: "Configura las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para guardar reservas reales.",
        variant: "warning",
      });
      return;
    }

    if (!selectedDates[0] || !selectedDates[1]) {
      mostrarAlertaApp({
        title: "Selecciona las fechas",
        message:
          "Por favor selecciona una fecha de inicio y fin en el calendario.",
        variant: "warning",
      });
      return;
    }

    if (!formData.guests || Number(formData.guests) <= 0) {
      mostrarAlertaApp({
        title: "Indica el número de personas",
        message: "La reserva necesita al menos una persona.",
        variant: "warning",
      });
      return;
    }

    const nochesReserva = calcularNoches(selectedDates[0], selectedDates[1]);

    if (nochesReserva <= 0) {
      mostrarAlertaApp({
        title: "Revisa las fechas",
        message: "La fecha de salida debe ser posterior a la fecha de entrada.",
        variant: "warning",
      });
      return;
    }

    const precioExtras = extrasSeleccionados.reduce(
      (total, extra) => total + extra.precio * extra.cantidad,
      0,
    );

    const reservationData = {
      ...formData,
      checkIn: formatearFecha(selectedDates[0]),
      checkOut: formatearFecha(selectedDates[1]),
      nights: nochesReserva,
      extras: extrasSeleccionados,
    };

    setGuardandoReserva(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const precioAlojamiento = await calcularPrecioAlojamiento(
        selectedDates[0],
        selectedDates[1],
      );
      const precioTotal = precioAlojamiento + precioExtras;
    
      const { data: reservaGuardada, error: errorReserva } = await supabase
        .from("reservas")
        .insert({
          usuario_id: user?.id ?? null,
          nombre_cliente: reservationData.name,
          email_cliente: reservationData.email,
          telefono_cliente: reservationData.phone || null,
          fecha_entrada: formatearFechaSql(selectedDates[0]),
          fecha_salida: formatearFechaSql(selectedDates[1]),
          numero_personas: Number(reservationData.guests),
          precio_alojamiento: precioAlojamiento,
          precio_extras: precioExtras,
          precio_total: precioTotal,
        })
        .select("id")
        .single();

      if (errorReserva) throw errorReserva;

      if (extrasSeleccionados.length > 0) {
        const reservasExtras = extrasSeleccionados.map((extra) => ({
          reserva_id: reservaGuardada.id,
          extra_id: extra.id,
          cantidad: extra.cantidad,
          precio_unitario: extra.precio,
        }));

        const { error: errorExtras } = await supabase
          .from("reservas_extras")
          .insert(reservasExtras);

        if (errorExtras) throw errorExtras;
      }

      mostrarAlertaApp({
        title: "Reserva solicitada",
        message: `Reserva guardada del ${reservationData.checkIn} al ${reservationData.checkOut}. Te contactaremos pronto para confirmar.`,
        variant: "success",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        guests: "2",
        observations: "",
      });
      setSelectedDates([null, null]);
      setExtrasSeleccionados([]);
      setRecargaCalendario((valor) => valor + 1);
    } catch (error) {
      console.error("Error al guardar la reserva:", error);
      mostrarAlertaApp({
        title: "No se pudo guardar la reserva",
        message: error.message || "Revisa la configuración de Supabase e inténtalo de nuevo.",
        variant: "warning",
      });
    } finally {
      setGuardandoReserva(false);
    }
  };

  const startDate = selectedDates[0];
  const endDate = selectedDates[1];
  const selectedNights =
    startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      : 0;
  const totalExtras = extrasSeleccionados.reduce(
    (total, extra) => total + extra.precio * extra.cantidad,
    0,
  );

  return (
    <section
      className="scroll-mt-24 bg-brand px-3 py-6 text-white sm:px-5 lg:px-8 lg:py-8"
      id="reserva"
      aria-labelledby="reserva-heading"
    >
      <div className="mx-auto flex w-full max-w-[1900px] flex-col items-center gap-8">
        <h2
          id="reserva-heading"
          className="text-center font-display text-4xl text-white"
        >
          Reserva
        </h2>

        <MostrarCalendario
          showHeading={false}
          onDateChange={manejarCambioCalendario}
          selectedRange={selectedDates}
          refreshKey={recargaCalendario}
        >
          <div className="flex h-full flex-col gap-5">
            <div className="rounded-[1.6rem] border border-white/14 bg-white/10 px-5 py-5 text-left text-white backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-dark">
                Tu selección
              </p>

              {startDate && endDate ? (
                <div className="mt-3">
                  <p className="text-sm text-white/75">Fechas seleccionadas</p>
                  <p className="mt-1 font-display text-2xl text-white">
                    {formatearFecha(startDate)} - {formatearFecha(endDate)}
                  </p>
                  <p className="mt-2 text-sm text-white/75">
                    {selectedNights} noches
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Selecciona en el calendario tu fecha de entrada y salida para
                  completar la reserva.
                </p>
              )}
            </div>

            <div className="flex flex-1 flex-col rounded-[1.6rem] border border-white/14 bg-white/10 px-5 py-6 text-left text-white shadow-[0_10px_30px_rgba(79,66,36,0.08)] backdrop-blur-md">
              <h3 className="font-display text-[1.5rem] text-white">
                Completa tu reserva
              </h3>

              <form
                onSubmit={manejarEnvio}
                className="mt-4 flex flex-1 flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold text-white/88"
                  >
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={manejarCambio}
                    required
                    placeholder="Tu nombre"
                    className="rounded-lg border border-white/18 bg-white/14 px-3.5 py-3 text-[0.95rem] text-white transition placeholder:text-white/45 focus:border-white/30 focus:bg-white/18 focus:outline-none focus:ring-4 focus:ring-white/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-white/88"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={manejarCambio}
                    required
                    placeholder="tu@email.com"
                    className="rounded-lg border border-white/18 bg-white/14 px-3.5 py-3 text-[0.95rem] text-white transition placeholder:text-white/45 focus:border-white/30 focus:bg-white/18 focus:outline-none focus:ring-4 focus:ring-white/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="phone"
                    className="text-sm font-semibold text-white/88"
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={manejarCambio}
                    placeholder="+34 123 456 789"
                    className="rounded-lg border border-white/18 bg-white/14 px-3.5 py-3 text-[0.95rem] text-white transition placeholder:text-white/45 focus:border-white/30 focus:bg-white/18 focus:outline-none focus:ring-4 focus:ring-white/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="guests"
                    className="text-sm font-semibold text-white/88"
                  >
                    Número de personas *
                  </label>
                  <input
                    type="number"
                    id="guests"
                    name="guests"
                    min="1"
                    value={formData.guests}
                    onChange={manejarCambio}
                    required
                    className="rounded-lg border border-white/18 bg-white/14 px-3.5 py-3 text-[0.95rem] text-white transition placeholder:text-white/45 focus:border-white/30 focus:bg-white/18 focus:outline-none focus:ring-4 focus:ring-white/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="observations"
                    className="text-sm font-semibold text-white/88"
                  >
                    Observaciones
                  </label>
                  <textarea
                    id="observations"
                    name="observations"
                    rows="4"
                    value={formData.observations}
                    onChange={manejarCambio}
                    placeholder="Escribe cualquier detalle importante para tu reserva"
                    className="rounded-lg border border-white/18 bg-white/14 px-3.5 py-3 text-[0.95rem] text-white transition placeholder:text-white/45 focus:border-white/30 focus:bg-white/18 focus:outline-none focus:ring-4 focus:ring-white/10 resize-y"
                  />
                </div>

                <div className="rounded-[1.35rem] border border-white/14 bg-white/8 px-4 py-4">
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Extras para tu reserva
                      </p>
                      <p className="mt-1 text-sm text-white/70">
                        Añade servicios extra antes de confirmar tu estancia.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={abrirModalExtras}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-white/16 bg-white/12 px-4 py-3 text-sm font-semibold whitespace-nowrap text-white transition hover:border-white/24 hover:bg-white/18 sm:w-auto sm:self-start cursor-pointer"
                    >
                      Añadir extras
                    </button>
                  </div>

                  {extrasSeleccionados.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {extrasSeleccionados.map((extra) => (
                        <div
                          key={extra.id}
                          className="flex items-center justify-between rounded-xl border border-white/12 bg-white/10 px-3 py-3 text-sm"
                        >
                          <div>
                            <p className="font-semibold text-white">
                              {extra.nombre}
                            </p>
                            <p className="mt-1 text-white/68">
                              {extra.cantidad} x{" "}
                              {formatearImporte(extra.precio)}
                            </p>
                          </div>
                          <p className="font-semibold text-white">
                            {formatearImporte(extra.precio * extra.cantidad)}
                          </p>
                        </div>
                      ))}

                      <div className="flex items-center justify-between border-t border-white/10 pt-2 text-sm">
                        <span className="text-white/72">Total extras</span>
                        <span className="font-semibold text-white">
                          {formatearImporte(totalExtras)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-white/68">
                      Aún no has seleccionado ningún extra.
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-2">
                  <button
                    type="submit"
                    disabled={guardandoReserva}
                    className="inline-flex self-start rounded-lg bg-linear-to-br from-accent to-accent-dark px-6 py-3 text-[0.95rem] font-bold text-white shadow-[0_4px_15px_rgba(122,143,78,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(122,143,78,0.4)]"
                  >
                    {guardandoReserva ? "Guardando reserva..." : "Confirmar reserva"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </MostrarCalendario>
      </div>

      {modalExtrasAbierto ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#24180b]/70 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="extras-modal-title"
          onClick={cerrarModalExtras}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/16 bg-[#f7f1e5] text-copy shadow-[0_24px_80px_rgba(36,24,11,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-brand/12 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-dark">
                  Reserva personalizada
                </p>
                <h3
                  id="extras-modal-title"
                  className="mt-2 font-display text-3xl text-copy"
                >
                  Selecciona tus extras
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Elige los servicios que quieras añadir a tu reserva y ajusta
                  la cantidad si lo necesitas.
                </p>
              </div>

              <button
                type="button"
                className="rounded-full border border-brand/14 bg-white px-4 py-2 text-sm font-semibold text-copy transition hover:border-brand/26 hover:text-brand-dark"
                onClick={cerrarModalExtras}
              >
                Cerrar
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-5 py-5 sm:px-6">
              {cargandoExtras ? (
                <p className="text-sm text-muted">
                  Cargando extras disponibles...
                </p>
              ) : extrasDisponibles.length > 0 ? (
                <div className="space-y-3">
                  {extrasDisponibles.map((extra) => {
                    const seleccionado = obtenerExtraSeleccionado(extra.id);

                    return (
                      <div
                        key={extra.id}
                        className={`rounded-[1.4rem] border px-4 py-4 transition ${
                          seleccionado
                            ? "border-brand/30 bg-brand/10"
                            : "border-brand/10 bg-white/85"
                        }`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={Boolean(seleccionado)}
                              onChange={() => alternarExtra(extra)}
                              className="mt-1 h-4 w-4 accent-[#a68c5e]"
                            />
                            <span>
                              <span className="block text-base font-semibold text-copy">
                                {extra.nombre}
                              </span>
                              {extra.descripcion ? (
                                <span className="mt-1 block text-sm leading-6 text-muted">
                                  {extra.descripcion}
                                </span>
                              ) : null}
                            </span>
                          </label>

                          <div className="flex items-center justify-between gap-4 lg:min-w-[230px] lg:justify-end">
                            <p className="text-sm font-semibold text-brand-dark">
                              {formatearImporte(extra.precio)}
                            </p>

                            {seleccionado ? (
                              <div className="inline-flex items-center rounded-full border border-brand/18 bg-white">
                                <button
                                  type="button"
                                  onClick={() =>
                                    actualizarCantidadExtra(extra.id, -1)
                                  }
                                  className="h-10 w-10 rounded-full text-lg font-semibold text-copy transition hover:bg-brand/10"
                                  aria-label={`Restar cantidad de ${extra.nombre}`}
                                >
                                  -
                                </button>
                                <span className="min-w-[2.5rem] text-center text-sm font-semibold text-copy">
                                  {seleccionado.cantidad}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    actualizarCantidadExtra(extra.id, 1)
                                  }
                                  className="h-10 w-10 rounded-full text-lg font-semibold text-copy transition hover:bg-brand/10"
                                  aria-label={`Sumar cantidad de ${extra.nombre}`}
                                >
                                  +
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted">
                  No hay extras disponibles en este momento.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-brand/12 bg-white/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-sm font-semibold text-copy">
                  {extrasSeleccionados.length} extra
                  {extrasSeleccionados.length === 1 ? "" : "s"} seleccionado
                  {extrasSeleccionados.length === 1 ? "" : "s"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Total actual de extras: {formatearImporte(totalExtras)}
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModalExtras}
                className="inline-flex items-center justify-center rounded-lg bg-linear-to-br from-accent to-accent-dark px-5 py-3 text-sm font-bold text-white shadow-[0_4px_15px_rgba(122,143,78,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_22px_rgba(122,143,78,0.34)]"
              >
                Guardar extras
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Reserva;
