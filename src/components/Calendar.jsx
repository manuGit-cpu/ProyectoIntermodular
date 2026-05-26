import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import { supabase } from "../supabase/client.js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const IMAGE_BASE_PATH = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/la-galana`
  : "/images/la-galana";
const RESERVATION_IMAGE = `${IMAGE_BASE_PATH}/interior/dormitorio-calido.webp`;

export default function MostrarCalendario({
  showHeading = true,
  onDateChange = null,
  selectedRange = [null, null],
  refreshKey = 0,
  children = null,
}) {
  const [reservas, setReservas] = useState([]);
  const [mesActual, setMesActual] = useState(new Date());

  const monthLabel = mesActual.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const formatearFecha = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const crearFechaDesdeSql = (fechaSql) => {
    if (!fechaSql) return null;
    const [year, month, day] = fechaSql.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const diasReservados = useMemo(() => {
    const fechas = new Set();

    reservas.forEach((reserva) => {
      const fechaEntrada = crearFechaDesdeSql(reserva.fecha_entrada);
      const fechaSalida = crearFechaDesdeSql(reserva.fecha_salida);

      if (!fechaEntrada || !fechaSalida) return;

      const fechaActual = new Date(fechaEntrada);

      while (fechaActual <= fechaSalida) {
        fechas.add(formatearFecha(fechaActual));
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
      
    });

    return fechas;
  }, [reservas]);

  useEffect(() => {
    if (!supabase) {
      console.log("No hay conexión a la base de datos" + supabase);
      return;
    }

    const obtenerReservas = async () => {
      const primerDia = new Date(
        mesActual.getFullYear(),
        mesActual.getMonth(),
        1,
      );
      const ultimoDia = new Date(
        mesActual.getFullYear(),
        mesActual.getMonth() + 1,
        0,
      );

      const { data, error } = await supabase
        .from("reservas")
        .select("fecha_entrada, fecha_salida")
        .lte("fecha_entrada", formatearFecha(ultimoDia))
        .gte("fecha_salida", formatearFecha(primerDia));

      if (error) {
        console.error("Error al obtener reservas:", error);
      } else {
        setReservas(data ?? []);
      }
    };

    obtenerReservas();
  }, [mesActual, refreshKey]);

  const obtenerEstado = (date) => {
    return diasReservados.has(formatearFecha(date)) ? "confirmada" : "disponible";
  };

  const fechaEstaReservada = (date) => diasReservados.has(formatearFecha(date));

  const rangoContieneFechaReservada = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return false;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    const fechaActual = new Date(inicio <= fin ? inicio : fin);
    const fechaLimite = new Date(inicio <= fin ? fin : inicio);

    while (fechaActual <= fechaLimite) {
      if (fechaEstaReservada(fechaActual)) {
        return true;
      }

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return false;
  };

  const estaFechaEnRango = (date) => {
    if (!selectedRange[0] || !selectedRange[1]) return false;

    const start = new Date(selectedRange[0]);
    const end = new Date(selectedRange[1]);
    const current = new Date(date);

    current.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return current >= start && current <= end;
  };

  const manejarCambioCalendario = (value) => {
    if (Array.isArray(value) && rangoContieneFechaReservada(value[0], value[1])) {
      mostrarAlertaApp({
        title: "Fechas no disponibles",
        message: "La estancia seleccionada incluye días ya reservados. Elige otro rango disponible.",
        variant: "warning",
      });
      onDateChange?.([null, null]);
      return;
    }

    if (onDateChange) {
      onDateChange(value);
    }
  };

  return (
    <div
      className={`calendar-shell flex w-full flex-col ${
        showHeading ? "max-w-3xl" : "calendar-shell--reservation max-w-[1640px]"
      }`}
    >
      {showHeading ? (
        <div className="mb-5 space-y-3 text-center sm:mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
            Calendario de estancias
          </p>
          <h2 className="font-display text-3xl text-brand sm:text-4xl">
            Disponibilidad
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted sm:text-base">
            Consulta de un vistazo los días disponibles y selecciona tu
            estancia ideal.
          </p>
        </div>
      ) : null}

      <div className="calendar-shell__frame w-full overflow-hidden rounded-[2rem] border border-white/18 bg-linear-to-br from-white/14 via-[#e6d2aa]/18 to-[#b89458]/20 p-4 shadow-[0_18px_50px_rgba(79,66,36,0.14)] backdrop-blur-[10px] sm:p-5 lg:p-6">
        <div className="mb-4 flex flex-col gap-3 rounded-[1.6rem] border border-white/14 bg-white/10 px-4 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-dark">
              Vista actual
            </p>
            <p className="mt-1 font-display text-2xl text-copy capitalize">
              {monthLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold sm:justify-end">
            <span className="calendar-legend calendar-legend--available">
              Disponible
            </span>
            <span className="calendar-legend calendar-legend--confirmed">
              Reservado
            </span>
          </div>
        </div>

        <div
          className={
            children
              ? "grid gap-6 lg:items-start lg:grid-cols-[minmax(580px,1.32fr)_minmax(410px,0.9fr)] xl:grid-cols-[minmax(680px,1.45fr)_minmax(450px,0.92fr)]"
              : ""
          }
        >
          <div className={children ? "flex flex-col gap-4" : ""}>
            <Calendar
              className={
                showHeading
                  ? "calendar-shell__calendar"
                  : "calendar-shell__calendar calendar-shell__calendar--reservation"
              }
              locale="es-ES"
              formatShortWeekday={(_, date) =>
                date
                  .toLocaleDateString("es-ES", { weekday: "short" })
                  .replace(".", "")
                  .slice(0, 2)
              }
              formatMonthYear={(_, date) =>
                date.toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })
              }
              next2Label={null}
              prev2Label={null}
              onActiveStartDateChange={({ activeStartDate }) =>
                setMesActual(activeStartDate)
              }
              onChange={manejarCambioCalendario}
              value={selectedRange}
              selectRange={true}
              tileDisabled={({ date, view }) =>
                view === "month" && fechaEstaReservada(date)
              }
              tileClassName={({ date, view }) => {
                if (view !== "month") return null;
                let classes = obtenerEstado(date);
                if (estaFechaEnRango(date)) {
                  classes += " in-range";
                }
                return classes;
              }}
              tileContent={({ date, view }) =>
                view === "month" && fechaEstaReservada(date) ? (
                  <span className="calendar-reserved-bg" aria-hidden="true" />
                ) : null
              }
            />

            {!showHeading ? (
              <div className="relative h-[200px] overflow-hidden rounded-[1.9rem] border border-white/16 shadow-[0_18px_45px_rgba(79,66,36,0.16)] sm:h-[250px] lg:h-[400px]">
                <img
                  src={RESERVATION_IMAGE}
                  alt="Interior acogedor de la casa rural"
                  className="h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-linear-to-t from-[#24180b]/70 via-[#24180b]/20 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/75">
                    Estancia
                  </p>
                  <p className="mt-2 font-display text-2xl leading-tight">
                    Un espacio cálido para desconectar
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {children ? (
            <div className="self-start lg:pt-2">{children}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
