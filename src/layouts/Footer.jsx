export default function Footer() {
  return (
    <footer className="site-footer" id="mapa" aria-label="Pie de página">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <a className="site-footer__logo" href="#hero" aria-label="Ir al inicio">
            <img className="site-footer__logoImg" src="/vite.svg" alt="La Galana" />
            <div className="site-footer__logoText">
              <div className="site-footer__logoTitle">LaGalana</div>
              <div className="site-footer__logoSub">casa rural</div>
            </div>
          </a>

          <p className="site-footer__lead">
            <strong>La Galana</strong> · Casa rural de alquiler completo en Trabazos · Aliste · Zamora
          </p>
          <p className="site-footer__desc">
            La Galana es una casa rural situada en el noroeste de la provincia de Zamora, muy cerca
            de la frontera con Portugal, en un pequeño pueblo de la comarca de Aliste llamado
            Trabazos. Se trata de una casa de nueva pero cuidada construcción en la que se han
            empleado los materiales típicos de la zona, como la piedra y la madera.
          </p>
        </div>

        <nav className="site-footer__col" aria-label="Enlaces La Galana">
          <h3 className="site-footer__title">La Galana</h3>
          <ul className="site-footer__list">
            <li>
              <a href="#reserva">Reserva</a>
            </li>
            <li>
              <a href="#hero">Inicio</a>
            </li>
            <li>
              <a href="#gallery">Galería</a>
            </li>
            <li>
              <a href="#info">Info</a>
            </li>
          </ul>

          <ul className="site-footer__list site-footer__list--spaced">
            <li>
              <a href="#hero">Un Lugar Para Descansar</a>
            </li>
            <li>
              <a href="#reserva">Precios</a>
            </li>
            <li>
              <a href="#info">Equipamiento</a>
            </li>
            <li>
              <a href="#mapa">Localización</a>
            </li>
            <li>
              <a href="#info">Actividades</a>
            </li>
            <li>
              <a href="#mapa">Contacto</a>
            </li>
            <li>
              <a href="#info">Política de Privacidad y Cookies</a>
            </li>
            <li>
              <a href="#info">Aviso Legal</a>
            </li>
            <li>
              <a href="#mapa">Cómo llegar</a>
            </li>
            <li>
              <a href="tel:+34 669 31 34 37">Llamar</a>
            </li>
            <li>
              <a href="https://wa.me/34669313437" target="_blank" rel="noreferrer">
                Whatsapp
              </a>
            </li>
          </ul>
        </nav>

        <div className="site-footer__col">
          <h3 className="site-footer__title">Contacto</h3>
          <dl className="site-footer__dl">
            <div className="site-footer__dlRow">
              <dt>Dirección:</dt>
              <dd>Soledad, s/n, 49516 Trabazos, España</dd>
            </div>
            <div className="site-footer__dlRow">
              <dt>Teléfono:</dt>
              <dd>
                <a href="tel:+34669313437">(+34) 669 31 34 37</a>
              </dd>
            </div>
            <div className="site-footer__dlRow">
              <dt>Whatsapp:</dt>
              <dd>
                <a href="https://wa.me/34669313437" target="_blank" rel="noreferrer">
                  (+34) 669 31 34 37
                </a>
              </dd>
            </div>
            <div className="site-footer__dlRow">
              <dt>eMail:</dt>
              <dd>
                <a href="mailto:info@casaruralgalana.com">info@casaruralgalana.com</a>
              </dd>
            </div>
          </dl>

          <h3 className="site-footer__title site-footer__title--mt">Síguenos</h3>
          <div className="site-footer__social" aria-label="Redes sociales">
            <a className="site-footer__socialBtn" href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.6c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5V12H18l-.5 3h-2.5v7A10 10 0 0 0 22 12z" />
              </svg>
            </a>
            <a className="site-footer__socialBtn" href="#mapa" aria-label="Ubicación">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </a>
            <a className="site-footer__socialBtn" href="#reserva" aria-label="Reservar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M7 7h10M7 12h10M7 17h10" />
                <path d="M6 3h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
