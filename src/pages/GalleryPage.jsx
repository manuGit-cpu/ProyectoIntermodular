import { useEffect, useMemo, useState } from "react";
import BarraNavegacion from "../components/NavBar";
import RevelarAlDesplazar from "../components/ScrollReveal";
import PiePagina from "../layouts/Footer";
import { GALLERY_SECTIONS } from "../data/galleryImages";

const toneClasses = {
  brand: "bg-brand text-white",
  accent: "bg-accent text-white",
  copy: "bg-copy text-white",
};

function IconoFlechaIzquierda({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconoFlechaDerecha({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TarjetaGaleria({ item, index, onOpen }) {
  const featured = index % 7 === 0;

  return (
    <RevelarAlDesplazar
      as="figure"
      x={index % 2 === 0 ? -42 : 42}
      mobileX={index % 2 === 0 ? -16 : 16}
      amount={0.08}
      delay={Math.min((index % 6) * 0.06, 0.3)}
      className={`group relative m-0 overflow-hidden rounded-lg bg-white shadow-[0_14px_34px_rgba(44,44,44,0.10)] ${
        featured ? "sm:col-span-2 sm:row-span-2" : ""
      }`}
    >
      <button
        type="button"
        className="block h-full w-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
        onClick={onOpen}
        aria-label={`Ampliar ${item.title}`}
      >
        <img
          className={`h-full min-h-[220px] w-full object-cover transition duration-500 group-hover:scale-105 ${
            featured ? "sm:min-h-[460px]" : ""
          }`}
          src={item.src}
          alt={item.alt}
          loading="lazy"
        />
      </button>
      <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-copy/78 via-copy/42 to-transparent px-4 pt-12 pb-4 text-left text-white opacity-0 transition duration-300 group-hover:opacity-100">
        <span className="font-display text-xl">{item.title}</span>
      </figcaption>
    </RevelarAlDesplazar>
  );
}

function SeccionGaleria({ section, index, startIndex, onOpenImage }) {
  return (
    <RevelarAlDesplazar
      as="section"
      id={section.id}
      x={index % 2 === 0 ? -56 : 56}
      className="scroll-mt-28 py-14 sm:py-18"
    >
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span
            className={`inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] ${
              toneClasses[section.tone]
            }`}
          >
            {section.images.length} fotos
          </span>
          <h2 className="mt-4 font-display text-4xl text-copy sm:text-5xl">{section.title}</h2>
        </div>
        <p className="max-w-xl text-base leading-7 text-muted">{section.intro}</p>
      </div>

      <div className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.images.map((item, index) => (
          <TarjetaGaleria
            key={item.src}
            item={item}
            index={index}
            onOpen={() => onOpenImage(startIndex + index)}
          />
        ))}
      </div>
    </RevelarAlDesplazar>
  );
}

function VisorGaleria({ images, selectedIndex, onClose, onSelect }) {
  const item = images[selectedIndex];

  useEffect(() => {
    if (!item) return;

    const manejarTeclaPulsada = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        onSelect((selectedIndex - 1 + images.length) % images.length);
      }

      if (event.key === "ArrowRight") {
        onSelect((selectedIndex + 1) % images.length);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", manejarTeclaPulsada);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", manejarTeclaPulsada);
    };
  }, [images.length, item, onClose, onSelect, selectedIndex]);

  if (!item) return null;

  const mostrarAnterior = () => onSelect((selectedIndex - 1 + images.length) % images.length);
  const mostrarSiguiente = () => onSelect((selectedIndex + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-copy/92 px-4 py-6 backdrop-blur-sm sm:px-8"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <div className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center gap-4">
        <button
          type="button"
          className="absolute top-0 right-0 z-10 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
          onClick={onClose}
        >
          Cerrar
        </button>

        <button
          type="button"
          className="absolute top-1/2 left-0 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white backdrop-blur-md transition hover:bg-white/20 sm:inline-flex"
          onClick={(event) => {
            event.stopPropagation();
            mostrarAnterior();
          }}
          aria-label="Imagen anterior"
        >
          <IconoFlechaIzquierda className="h-7 w-7" />
        </button>

        <button
          type="button"
          className="absolute top-1/2 right-0 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white backdrop-blur-md transition hover:bg-white/20 sm:inline-flex"
          onClick={(event) => {
            event.stopPropagation();
            mostrarSiguiente();
          }}
          aria-label="Imagen siguiente"
        >
          <IconoFlechaDerecha className="h-7 w-7" />
        </button>

        <figure
          className="m-0 flex max-h-full w-full flex-col items-center gap-4"
          onClick={(event) => event.stopPropagation()}
        >
          <img
            className="max-h-[78vh] w-auto max-w-full rounded-lg object-contain shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
            src={item.src}
            alt={item.alt}
          />
          <figcaption className="text-center text-white">
            <p className="font-display text-2xl">{item.title}</p>
            <p className="mt-1 text-sm font-semibold text-white/68">
              {item.sectionTitle} · {selectedIndex + 1} de {images.length}
            </p>
          </figcaption>
        </figure>

        <div className="flex gap-3 sm:hidden">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white backdrop-blur-md"
            onClick={(event) => {
              event.stopPropagation();
              mostrarAnterior();
            }}
            aria-label="Imagen anterior"
          >
            <IconoFlechaIzquierda className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white backdrop-blur-md"
            onClick={(event) => {
              event.stopPropagation();
              mostrarSiguiente();
            }}
            aria-label="Imagen siguiente"
          >
            <IconoFlechaDerecha className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PaginaGaleria() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const totalImages = GALLERY_SECTIONS.reduce((total, section) => total + section.images.length, 0);
  const heroImage = GALLERY_SECTIONS[0].images[1];
  const sectionStartIndexes = useMemo(
    () =>
      GALLERY_SECTIONS.reduce((indexes, section, index) => {
        const previousTotal =
          index === 0 ? 0 : indexes[index - 1] + GALLERY_SECTIONS[index - 1].images.length;
        return [...indexes, previousTotal];
      }, []),
    []
  );
  const galleryImages = useMemo(
    () =>
      GALLERY_SECTIONS.flatMap((section) =>
        section.images.map((image) => ({
          ...image,
          sectionTitle: section.title,
        }))
      ),
    []
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-copy">
      <BarraNavegacion />

      <main>
        <section className="relative mt-[72px] overflow-hidden bg-copy px-6 py-18 text-white sm:px-10 lg:px-16 lg:py-24">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-34"
            src={heroImage.src}
            alt=""
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-linear-to-r from-copy via-copy/78 to-copy/30" />

          <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <a
                href="/"
                className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/88 no-underline backdrop-blur-md transition hover:bg-white/16 hover:text-white"
              >
                Volver al inicio
              </a>
              <h1 className="mt-8 font-display text-5xl leading-tight sm:text-6xl">Galería</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/82">
                Todas las imágenes de La Galana organizadas para ver la casa por dentro, por fuera y en sus momentos de ocio.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/16 bg-white/10 p-2 backdrop-blur-md">
              {GALLERY_SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="rounded-md px-4 py-3 text-center text-sm font-bold text-white no-underline transition hover:bg-white/14"
                >
                  <span className="block font-display text-2xl">{section.images.length}</span>
                  {section.title}
                </a>
              ))}
              <div className="col-span-2 rounded-md bg-brand px-4 py-3 text-center text-sm font-bold text-white">
                {totalImages} imágenes en total
              </div>
            </div>
          </div>
        </section>

        <nav
          className="sticky top-[74px] z-30 border-y border-brand/10 bg-surface/92 px-4 py-3 backdrop-blur-md"
          aria-label="Categorías de galería"
        >
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
            {GALLERY_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="shrink-0 rounded-full border border-brand/14 bg-white px-5 py-2 text-sm font-semibold text-copy no-underline shadow-[0_6px_18px_rgba(44,44,44,0.06)] transition hover:border-brand/35 hover:text-brand-dark"
              >
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-0">
          {GALLERY_SECTIONS.map((section, index) => (
            <SeccionGaleria
              key={section.id}
              section={section}
              index={index}
              startIndex={sectionStartIndexes[index]}
              onOpenImage={setSelectedIndex}
            />
          ))}
        </div>
      </main>

      <PiePagina />

      <VisorGaleria
        images={galleryImages}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onSelect={setSelectedIndex}
      />
    </div>
  );
}

export default PaginaGaleria;
