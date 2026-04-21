import { useState } from "react";
import ShowCalendar from "./Calendar";
import { showAppAlert } from "../utils/appAlert";

function Reserva() {
  const [selectedDates, setSelectedDates] = useState([null, null]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    observations: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleCalendarChange = (value) => {
    if (Array.isArray(value)) {
      setSelectedDates(value);
    } else {
      setSelectedDates([value, null]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDates[0] || !selectedDates[1]) {
      showAppAlert({
        title: "Selecciona las fechas",
        message: "Por favor selecciona una fecha de inicio y fin en el calendario.",
        variant: "warning",
      });
      return;
    }

    const reservationData = {
      ...formData,
      checkIn: formatDate(selectedDates[0]),
      checkOut: formatDate(selectedDates[1]),
      nights: Math.ceil((selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24)),
    };

    console.log("Reserva enviada:", reservationData);
    showAppAlert({
      title: "Reserva solicitada",
      message: `Reserva solicitada del ${reservationData.checkIn} al ${reservationData.checkOut}. Te contactaremos pronto para confirmar.`,
      variant: "success",
    });

    setFormData({ name: "", email: "", phone: "", observations: "" });
    setSelectedDates([null, null]);
  };

  const startDate = selectedDates[0];
  const endDate = selectedDates[1];
  const selectedNights =
    startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      : 0;

  return (
    <section
      className="scroll-mt-24 bg-brand px-6 py-10 text-white sm:px-10 lg:px-15 lg:py-12.5"
      id="reserva"
      aria-labelledby="reserva-heading"
    >
      <div className="mx-auto flex w-full max-w-[1360px] flex-col items-center gap-8">
        <h2 id="reserva-heading" className="text-center font-display text-4xl text-white">
          Reserva
        </h2>

        <ShowCalendar
          showHeading={false}
          onDateChange={handleCalendarChange}
          selectedRange={selectedDates}
        >
          <div className="flex h-full flex-col gap-5">
            <div className="rounded-[1.6rem] border border-white/14 bg-white/10 px-5 py-5 text-left text-white backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-dark">
                Tu seleccion
              </p>

              {startDate && endDate ? (
                <div className="mt-3">
                  <p className="text-sm text-white/75">Fechas seleccionadas</p>
                  <p className="mt-1 font-display text-2xl text-white">
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </p>
                  <p className="mt-2 text-sm text-white/75">{selectedNights} noches</p>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Selecciona en el calendario tu fecha de entrada y salida para completar la
                  reserva.
                </p>
              )}
            </div>

            <div className="flex flex-1 flex-col rounded-[1.6rem] border border-white/14 bg-white/10 px-5 py-6 text-left text-white shadow-[0_10px_30px_rgba(79,66,36,0.08)] backdrop-blur-md">
              <h3 className="font-display text-[1.5rem] text-white">Completa tu reserva</h3>

              <form onSubmit={handleSubmit} className="mt-4 flex flex-1 flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-sm font-semibold text-white/88">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Tu nombre"
                    className="rounded-lg border border-white/18 bg-white/14 px-3.5 py-3 text-[0.95rem] text-white transition placeholder:text-white/45 focus:border-white/30 focus:bg-white/18 focus:outline-none focus:ring-4 focus:ring-white/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-white/88">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tu@email.com"
                    className="rounded-lg border border-white/18 bg-white/14 px-3.5 py-3 text-[0.95rem] text-white transition placeholder:text-white/45 focus:border-white/30 focus:bg-white/18 focus:outline-none focus:ring-4 focus:ring-white/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-sm font-semibold text-white/88">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+34 123 456 789"
                    className="rounded-lg border border-white/18 bg-white/14 px-3.5 py-3 text-[0.95rem] text-white transition placeholder:text-white/45 focus:border-white/30 focus:bg-white/18 focus:outline-none focus:ring-4 focus:ring-white/10"
                  />
                </div>

                <div className="mt-auto pt-2">
                  <button
                    type="submit"
                    className="inline-flex self-start rounded-lg bg-linear-to-br from-accent to-accent-dark px-6 py-3 text-[0.95rem] font-bold text-white shadow-[0_4px_15px_rgba(122,143,78,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(122,143,78,0.4)]"
                  >
                    Confirmar reserva
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ShowCalendar>
      </div>
    </section>
  );
}

export default Reserva;
