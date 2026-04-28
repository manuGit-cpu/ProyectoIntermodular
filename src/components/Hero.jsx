import { FEATURED_IMAGES } from "../data/laGalanaImages";

function Portada() {
  return (
    <section
      className="relative mt-[72px] flex min-h-[90vh] scroll-mt-24 items-center overflow-hidden bg-stone-900 bg-cover bg-center bg-no-repeat px-6 sm:px-10 lg:px-16"
      id="hero"
      style={{ backgroundImage: `url("${FEATURED_IMAGES.hero}")` }}
    >
      <div className="absolute inset-0 bg-neutral-900/45" aria-hidden="true" />

      <div className="relative z-10 max-w-2xl text-white">
        <h1 className="font-display text-5xl tracking-[0.02em] sm:text-6xl">
          Casa Rural La Galana
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/90 sm:text-xl">
          Tu escapada perfecta en plena naturaleza
        </p>
        <a
          href="#reserva"
          className="mt-8 inline-flex rounded-md bg-brand px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Reservar ahora
        </a>
      </div>
    </section>
  );
}

export default Portada;
