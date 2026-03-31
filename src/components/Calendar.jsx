import Calendar from "react-calendar";
import { supabase } from "../supabase/client.js";
import "react-calendar/dist/Calendar.css";
import "../css/App.css";
import { useEffect, useState } from "react";

export default function ShowCalendar() {
  
  const [reservas, setReservas] = useState([]);
  const [mesActual, setMesActual] = useState(new Date());

  const formatearFecha = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchReservas = async () => {
      const primerDia = new Date(
        mesActual.getFullYear(),
        mesActual.getMonth(),
        1
      );

      const ultimoDia = new Date(
        mesActual.getFullYear(),
        mesActual.getMonth() + 1,
        0
      );

      const { data, error } = await supabase
        .from("reservas")
        .select("*")
        .lte("fecha_inicio", formatearFecha(ultimoDia))
        .gte("fecha_fin", formatearFecha(primerDia));

      if (error) {
        console.error("Error al obtener reservas:", error);
      } else {
        setReservas(data);
      }
    };

    fetchReservas();
  }, [mesActual]);


  const getEstado = (date) => {
    const fechaActual = formatearFecha(date);

    const reserva = reservas.find(
      (r) =>
        fechaActual >= r.fecha_inicio &&
        fechaActual <= r.fecha_fin
    );
    

    if (!reserva) return "disponible";
    return reserva.estado.toLowerCase();
  };

  return (
    <div className="calendar-container">
      <h2>Disponibilidad</h2>

      <Calendar
        onActiveStartDateChange={({ activeStartDate }) =>
          setMesActual(activeStartDate)
        }
        tileClassName={({ date }) => getEstado(date)}
      />
    </div>
  );
}