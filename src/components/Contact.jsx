import "../css/App.css";

function Contact() {
  return (
    <section className="contact" id="mapa">
      <h2>Contacto</h2>
      <p>¿Tienes dudas? Estamos para ayudarte</p>

      <div className="contact-buttons">
        <a href="https://wa.me/34600000000" target="_blank">
          WhatsApp
        </a>
        <a href="tel:+34600000000">Llamar</a>
      </div>
    </section>
  );
}

export default Contact;