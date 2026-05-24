export default function PiePagina() {
  return (
    <footer
      className="scroll-mt-24 bg-[#f3f1ea] px-6 py-16 text-copy sm:px-10"
      id="mapa"
      aria-label="Pie de pagina"
    >
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 md:gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-[520px]">
          <a
            className="inline-flex items-center gap-3.5 text-inherit no-underline"
            href="/#hero"
            aria-label="Ir al inicio"
          >
            <img className="h-14 w-14" src="/logo-lagalana.png" alt="La Galana" />
            <div>
              <div className="font-display text-[34px] leading-none tracking-[0.2px]">LaGalana</div>
              <div className="mt-0.5 text-[13px] uppercase tracking-[0.28em] text-muted">
                casa rural
              </div>
            </div>
          </a>

          <p className="mt-[18px] mb-2.5 text-sm text-muted">
            <strong>La Galana</strong> Casa rural de alquiler completo en Trabazos · Aliste ·
            Zamora
          </p>
          <p className="text-sm leading-7 text-[#7a7a7a]">
            La Galana es una casa rural situada en el noroeste de la provincia de Zamora, muy cerca
            de la frontera con Portugal, en un pequeño pueblo de la comarca de Aliste llamado
            Trabazos. Se trata de una casa de nueva pero cuidada construccion en la que se han
            empleado los materiales típicos de la zona, como la piedra y la madera.
          </p>
        </div>

        <nav aria-label="Enlaces La Galana">
          <h3 className="mt-1.5 mb-3.5 text-base font-bold text-copy">La Galana</h3>
          <ul className="grid gap-2.5">
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/#reserva">
                Reserva
              </a>
            </li>
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/#hero">
                Inicio
              </a>
            </li>
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/galeria">
                Galeria
              </a>
            </li>
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/#info">
                Info
              </a>
            </li>
          </ul>

          <ul className="mt-6 grid gap-2.5">
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/#hero">
                Un Lugar Para Descansar
              </a>
            </li>
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/#reserva">
                Precios
              </a>
            </li>
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/#info">
                Equipamiento
              </a>
            </li>
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/#mapa">
                Localización
              </a>
            </li>
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/#info">
                Actividades
              </a>
            </li>
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/#mapa">
                Contacto
              </a>
            </li>
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/#info">
                Política de Privacidad y Cookies
              </a>
            </li>
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/#info">
                Aviso Legal
              </a>
            </li>
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="/#mapa">
                Cómo llegar
              </a>
            </li>
            <li>
              <a className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline" href="tel:+34 669 31 34 37">
                Llamar
              </a>
            </li>
            <li>
              <a
                className="text-sm text-[#4a4a4a] no-underline transition hover:text-brand-dark hover:underline"
                href="https://wa.me/34669313437"
                target="_blank"
                rel="noreferrer"
              >
                Whatsapp
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="mt-1.5 mb-3.5 text-base font-bold text-copy">Contacto</h3>
          <dl className="grid gap-3 text-sm text-[#4a4a4a]">
            <div className="grid grid-cols-[92px_1fr] gap-2.5">
              <dt className="font-bold text-muted">Dirección:</dt>
              <dd>Soledad, s/n, 49516 Trabazos, España</dd>
            </div>
            <div className="grid grid-cols-[92px_1fr] gap-2.5">
              <dt className="font-bold text-muted">Telefono:</dt>
              <dd>
                <a className="text-brand-dark no-underline hover:underline" href="tel:+34669313437">
                  (+34) 669 31 34 37
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-[92px_1fr] gap-2.5">
              <dt className="font-bold text-muted">Whatsapp:</dt>
              <dd>
                <a
                  className="text-brand-dark no-underline hover:underline"
                  href="https://wa.me/34669313437"
                  target="_blank"
                  rel="noreferrer"
                >
                  (+34) 669 31 34 37
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-[92px_1fr] gap-2.5">
              <dt className="font-bold text-muted">eMail:</dt>
              <dd>
                <a className="text-brand-dark no-underline hover:underline" href="mailto:info@casaruralgalana.com">
                  info@casaruralgalana.com
                </a>
              </dd>
            </div>
          </dl>

          <h3 className="mt-6 mb-3.5 text-base font-bold text-copy">Siguenos</h3>
          <div className="flex gap-[18px]" aria-label="Redes sociales">
            <a
              className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full bg-black/6 text-copy no-underline transition hover:-translate-y-0.5 hover:bg-black/10"
              href="#"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.6c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5V12H18l-.5 3h-2.5v7A10 10 0 0 0 22 12z" />
              </svg>
            </a>
            <a
              className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full bg-black/6 text-copy no-underline transition hover:-translate-y-0.5 hover:bg-black/10"
              href="/#mapa"
              aria-label="Ubicación"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-5 w-5">
                <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </a>
            <a
              className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full bg-black/6 text-copy no-underline transition hover:-translate-y-0.5 hover:bg-black/10"
              href="/#reserva"
              aria-label="Reservar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-5 w-5">
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
