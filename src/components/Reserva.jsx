import "../css/App.css";
import ShowCalendar from "./Calendar";

function Reserva() {
  return (
    <section className="reserva" id="reserva" aria-labelledby="reserva-heading">
      <h2 id="reserva-heading">Reserva</h2>
      <p className="reserva-lead">
        Consulta la disponibilidad del calendario y elige las fechas de tu estancia.
      </p>
      <ShowCalendar showHeading={false} />
    </section>
  );
}

export default Reserva;
