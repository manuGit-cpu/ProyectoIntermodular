import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function crearFechaDesdeSql(fechaSql) {
  if (!fechaSql) return null;
  const [anio, mes, dia] = String(fechaSql).split("-").map(Number);
  if (!anio || !mes || !dia) return null;
  return new Date(anio, mes - 1, dia);
}

function claveMes(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

function obtenerEtiquetaMes(fecha) {
  return fecha.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
}

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

function formatearNumero(valor) {
  return new Intl.NumberFormat("es-ES").format(Number(valor || 0));
}

function formatearPorcentaje(valor) {
  return `${Number(valor || 0).toFixed(1)}%`;
}

function calcularNoches(fechaEntrada, fechaSalida) {
  if (!fechaEntrada || !fechaSalida) return 0;
  const milisegundos = fechaSalida - fechaEntrada;
  return Math.max(0, Math.ceil(milisegundos / (1000 * 60 * 60 * 24)));
}

function obtenerFechaReferenciaReserva(reserva) {
  return crearFechaDesdeSql(reserva.created_at) || crearFechaDesdeSql(reserva.fecha_entrada);
}

function crearMesesAnio(anio) {
  return Array.from({ length: 12 }, (_, index) => {
    const fecha = new Date(anio, index, 1);
    return { fecha, etiqueta: obtenerEtiquetaMes(fecha) };
  });
}

function obtenerAniosDisponibles(reservas) {
  const anios = new Set([new Date().getFullYear()]);

  reservas.forEach((reserva) => {
    [
      obtenerFechaReferenciaReserva(reserva),
      crearFechaDesdeSql(reserva.fecha_entrada),
      crearFechaDesdeSql(reserva.fecha_salida),
    ].forEach((fecha) => {
      if (fecha && !Number.isNaN(fecha.getTime())) {
        anios.add(fecha.getFullYear());
      }
    });
  });

  return [...anios].sort((a, b) => b - a);
}

function crearSerieMensual({ registros, selector, meses }) {
  const mapa = new Map(meses.map((mes) => [claveMes(mes.fecha), 0]));

  registros.forEach((registro) => {
    const fechaReferencia = crearFechaDesdeSql(registro.created_at) || crearFechaDesdeSql(registro.fecha_entrada);
    if (!fechaReferencia) return;

    const clave = claveMes(fechaReferencia);
    if (!mapa.has(clave)) return;

    mapa.set(clave, mapa.get(clave) + Number(selector(registro) || 0));
  });

  return meses.map((mes) => mapa.get(claveMes(mes.fecha)) || 0);
}

function crearSerieOcupacionMensual({ reservas, meses }) {
  return meses.map((mes) => {
    const inicioMes = mes.fecha;
    const finMes = new Date(mes.fecha.getFullYear(), mes.fecha.getMonth() + 1, 0);
    const diasOcupados = new Set();

    reservas.forEach((reserva) => {
      const fechaEntrada = crearFechaDesdeSql(reserva.fecha_entrada);
      const fechaSalida = crearFechaDesdeSql(reserva.fecha_salida);

      if (!fechaEntrada || !fechaSalida) return;

      const inicioSolapado = fechaEntrada > inicioMes ? fechaEntrada : inicioMes;
      const finSolapado = fechaSalida < finMes ? fechaSalida : finMes;

      if (finSolapado < inicioSolapado) return;

      const fechaActual = new Date(inicioSolapado);
      while (fechaActual <= finSolapado) {
        diasOcupados.add(claveMes(fechaActual) + `-${String(fechaActual.getDate()).padStart(2, "0")}`);
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
    });

    const totalDiasMes = finMes.getDate();
    return totalDiasMes > 0 ? (diasOcupados.size / totalDiasMes) * 100 : 0;
  });
}

function Icono({ name, className = "h-5 w-5" }) {
  const iconos = {
    coin: (
      <>
        <path d="M12 3.5c4.7 0 8.5 2.1 8.5 4.7S16.7 13 12 13s-8.5-2.1-8.5-4.8S7.3 3.5 12 3.5Z" />
        <path d="M3.5 8.2V12c0 2.6 3.8 4.7 8.5 4.7s8.5-2.1 8.5-4.7V8.2" />
        <path d="M3.5 12v3.8c0 2.6 3.8 4.7 8.5 4.7s8.5-2.1 8.5-4.7V12" />
      </>
    ),
    bed: (
      <>
        <path d="M4 17.5V8.25A2.25 2.25 0 0 1 6.25 6h11.5A2.25 2.25 0 0 1 20 8.25V17.5" />
        <path d="M4 13.5h16" />
        <path d="M6.5 13.5V10.75A1.75 1.75 0 0 1 8.25 9h2.5a1.75 1.75 0 0 1 1.75 1.75v2.75" />
      </>
    ),
    ticket: (
      <>
        <path d="M5 6.5h14A1.5 1.5 0 0 1 20.5 8v2.2a2 2 0 0 0 0 3.6V16A1.5 1.5 0 0 1 19 17.5H5A1.5 1.5 0 0 1 3.5 16v-2.2a2 2 0 0 0 0-3.6V8A1.5 1.5 0 0 1 5 6.5Z" />
        <path d="M8 9h.01M8 12h.01M8 15h.01" />
      </>
    ),
    spark: (
      <>
        <path d="M4 17h16" />
        <path d="M6 14l3-3 3 2 4-6 2 2" />
      </>
    ),
    users: (
      <>
        <path d="M16 18.5v-1.3a3.3 3.3 0 0 0-3.3-3.3H7.3A3.3 3.3 0 0 0 4 17.2v1.3" />
        <path d="M12 12.2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M20.5 18.5v-1a2.6 2.6 0 0 0-2.6-2.6" />
        <path d="M16.8 6.7a2.4 2.4 0 1 1 0 4.8" />
      </>
    ),
    season: (
      <>
        <path d="M12 4v16" />
        <path d="M7 8c1.2-1.5 3-2.5 5-2.5s3.8 1 5 2.5" />
        <path d="M7 16c1.2 1.5 3 2.5 5 2.5s3.8-1 5-2.5" />
      </>
    ),
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
      {iconos[name]}
    </svg>
  );
}

function TarjetaMetrica({ titulo, dato, detalle, icono }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-brand/10 bg-white p-5 shadow-[0_12px_28px_rgba(44,44,44,0.06)]">
      <div className="flex items-center justify-start">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand-dark">
          <Icono name={icono} className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 font-display text-[2.35rem] leading-none text-copy">{dato}</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">{titulo}</p>
      <p className="mt-2 text-sm text-muted">{detalle}</p>
    </article>
  );
}

function TarjetaGraficoLinea({ titulo, subtitulo, etiquetas, series, formatearValor, sufijoValor = "" }) {
  const datos = etiquetas.map((etiqueta, index) => {
    const fila = { etiqueta };

    series.forEach((serie) => {
      fila[serie.label] = Number(serie.values[index] || 0);
    });

    return fila;
  });

  const formatearEtiqueta = (valor) => {
    const numero = Number(valor || 0);
    return numero.toLocaleString("es-ES");
  };

  return (
    <article className="rounded-[1.7rem] border border-brand/10 bg-white p-5 shadow-[0_14px_34px_rgba(44,44,44,0.06)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-3xl text-copy">{titulo}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitulo}</p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-semibold text-muted">
          {series.map((serie) => (
            <span key={serie.label} className="inline-flex items-center gap-2 rounded-full border border-brand/10 bg-surface px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: serie.color }} />
              {serie.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.2rem] border border-brand/8 bg-gradient-to-b from-white to-surface/70 p-3">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datos} margin={{ top: 20, right: 18, bottom: 10, left: 0 }} accessibilityLayer>
              <CartesianGrid stroke="rgba(120, 110, 94, 0.12)" vertical={false} />
              <XAxis
                dataKey="etiqueta"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#8a8174", fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#8a8174", fontSize: 12, fontWeight: 600 }}
                tickFormatter={formatearEtiqueta}
                width={42}
              />
              <Tooltip
                formatter={(value) => [formatearValor(Number(value || 0)) + sufijoValor, ""]}
                labelStyle={{ color: "#3d3121", fontWeight: 700 }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid rgba(194,168,120,0.18)",
                  boxShadow: "0 14px 30px rgba(44,44,44,0.1)",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "8px" }}
              />
              {series.map((serie) => (
                <Line
                  key={serie.label}
                  type="monotone"
                  dataKey={serie.label}
                  stroke={serie.color}
                  strokeWidth={3}
                  dot={{ r: 3.5, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 5.5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </article>
  );
}

export default function ResumenPanel({
  reservas = [],
  categorias = [],
  usuarios = [],
  extras = [],
  temporadas = [],
  cargando = false,
}) {
  const aniosDisponibles = useMemo(() => obtenerAniosDisponibles(reservas), [reservas]);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

  const resumen = useMemo(() => {
    const meses = crearMesesAnio(anioSeleccionado);
    const reservasDelAnio = reservas.filter((reserva) => {
      const fechaReferencia = obtenerFechaReferenciaReserva(reserva);
      return fechaReferencia?.getFullYear() === anioSeleccionado;
    });

    const ingresosMensuales = crearSerieMensual({
      registros: reservasDelAnio,
      meses,
      selector: (reserva) => Number(reserva.precio_total || 0),
    });
    const extrasMensuales = crearSerieMensual({
      registros: reservasDelAnio,
      meses,
      selector: (reserva) => Number(reserva.precio_extras || 0),
    });
    const reservasMensuales = crearSerieMensual({
      registros: reservasDelAnio,
      meses,
      selector: () => 1,
    });
    const ocupacionMensual = crearSerieOcupacionMensual({ reservas, meses });
    const ticketPromedioMensual = ingresosMensuales.map((ingreso, index) => {
      const reservasDelMes = reservasMensuales[index] || 0;
      return reservasDelMes > 0 ? ingreso / reservasDelMes : 0;
    });
    const nochesPorReserva = reservasDelAnio.map((reserva) =>
      calcularNoches(crearFechaDesdeSql(reserva.fecha_entrada), crearFechaDesdeSql(reserva.fecha_salida))
    );

    const ingresosTotales = reservasDelAnio.reduce((total, reserva) => total + Number(reserva.precio_total || 0), 0);
    const extrasTotales = reservasDelAnio.reduce((total, reserva) => total + Number(reserva.precio_extras || 0), 0);
    const ticketPromedio = reservasDelAnio.length > 0 ? ingresosTotales / reservasDelAnio.length : 0;
    const ocupacionMedia = ocupacionMensual.reduce((total, valor) => total + valor, 0) / ocupacionMensual.length;

    return {
      meses,
      reservasDelAnio,
      ingresosMensuales,
      extrasMensuales,
      reservasMensuales,
      ocupacionMensual,
      ocupacionMedia,
      nochesPorReserva,
      ingresosTotales,
      extrasTotales,
      ticketPromedio,
      ticketPromedioMensual,
    };
  }, [anioSeleccionado, reservas]);

  if (cargando) {
    return (
      <section id="resumen" className="scroll-mt-28 rounded-[2rem] border border-brand/10 bg-white p-6 shadow-[0_16px_48px_rgba(44,44,44,0.08)]">
        <p className="text-sm font-semibold text-muted">Cargando resumen de gesti贸n...</p>
      </section>
    );
  }

  return (
    <section id="resumen" className="scroll-mt-28">
      <div className="rounded-[2rem] border border-brand/10 bg-[linear-gradient(135deg,#fffdf8_0%,#f5efe2_100%)] p-6 shadow-[0_22px_70px_rgba(44,44,44,0.08)] sm:p-8">
        <div className="grid gap-8">
          <div>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-dark">Casa Rural La Galana</p>
                <h1 className="mt-3 font-display text-5xl leading-none text-copy sm:text-6xl">
                  Panel de control
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                  Una vista general del comportamiento de la casa: ingresos, ocupaci贸n, reservas y actividad
                  reciente para tomar decisiones con una mirada r谩pida.
                </p>
              </div>
              <label className="grid min-w-[180px] gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">
                A帽o mostrado
                <select
                  className="h-12 rounded-md border border-brand/16 bg-white px-4 text-sm font-bold normal-case tracking-normal text-copy outline-none transition focus:border-brand"
                  value={anioSeleccionado}
                  onChange={(event) => setAnioSeleccionado(Number(event.target.value))}
                >
                  {aniosDisponibles.map((anio) => (
                    <option key={anio} value={anio}>
                      {anio}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <TarjetaMetrica
                titulo="Ingresos totales"
                dato={formatearMoneda(resumen.ingresosTotales)}
                detalle={`Suma de las reservas registradas en ${anioSeleccionado}.`}
                icono="coin"
              />
              <TarjetaMetrica
                titulo="Ocupaci贸n media"
                dato={formatearPorcentaje(resumen.ocupacionMedia || 0)}
                detalle={`Media mensual de ocupaci髇 durante ${anioSeleccionado}.`}
                icono="bed"
              />
              <TarjetaMetrica
                titulo="Precio promedio"
                dato={formatearMoneda(resumen.ticketPromedio)}
                detalle={`Media sobre ${formatearNumero(resumen.reservasDelAnio.length)} reservas del a帽o.`}
                icono="ticket"
              />
              <TarjetaMetrica
                titulo="Reservas recibidas"
                dato={formatearNumero(resumen.reservasDelAnio.length)}
                detalle={`${formatearNumero(resumen.nochesPorReserva.reduce((total, valor) => total + valor, 0))} noches acumuladas.`}
                icono="spark"
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              <TarjetaGraficoLinea
                titulo="Ingresos y extras"
                subtitulo={`Evoluci髇 mensual de la facturaci髇 y de los servicios extra durante ${anioSeleccionado}.`}
                etiquetas={resumen.meses.map((mes) => mes.etiqueta)}
                series={[
                  { label: "Ingresos", values: resumen.ingresosMensuales, color: "#b89458" },
                  { label: "Extras", values: resumen.extrasMensuales, color: "#7f934f" },
                ]}
                formatearValor={formatearMoneda}
              />

              <TarjetaGraficoLinea
                titulo="Reservas mensuales"
                subtitulo={`Cantidad de reservas creadas cada mes de ${anioSeleccionado}.`}
                etiquetas={resumen.meses.map((mes) => mes.etiqueta)}
                series={[{ label: "Reservas", values: resumen.reservasMensuales, color: "#7f934f" }]}
                formatearValor={formatearNumero}
                sufijoValor=" reservas"
              />

              <TarjetaGraficoLinea
                titulo="Ocupaci贸n"
                subtitulo={`Porcentaje de d韆s ocupados en cada mes de ${anioSeleccionado}.`}
                etiquetas={resumen.meses.map((mes) => mes.etiqueta)}
                series={[{ label: "Ocupaci贸n", values: resumen.ocupacionMensual, color: "#b89458" }]}
                formatearValor={formatearPorcentaje}
              />
            </div>

            <div className="mt-10 grid gap-6 xl:grid-cols-4">
              <div className="rounded-[1.7rem] border border-brand/10 bg-white p-5 shadow-[0_14px_34px_rgba(44,44,44,0.06)] xl:col-span-4">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-dark">Estado general</p>
                <h2 className="mt-3 font-display text-3xl text-copy">Indicadores del sistema</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1.1rem] bg-surface p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Categor铆as de galer铆a</p>
                    <p className="mt-2 font-display text-3xl text-copy">{formatearNumero(categorias.length)}</p>
                  </div>
                  <div className="rounded-[1.1rem] bg-surface p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Usuarios registrados</p>
                    <p className="mt-2 font-display text-3xl text-copy">{formatearNumero(usuarios.length)}</p>
                  </div>
                  <div className="rounded-[1.1rem] bg-surface p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Extras activos</p>
                    <p className="mt-2 font-display text-3xl text-copy">
                      {formatearNumero(extras.filter((extra) => extra.activo).length)}
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] bg-surface p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Temporadas activas</p>
                    <p className="mt-2 font-display text-3xl text-copy">
                      {formatearNumero(temporadas.filter((temporada) => temporada.activo).length)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
