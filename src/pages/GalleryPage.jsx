import Navbar from "../components/NavBar";
import ScrollReveal from "../components/ScrollReveal";
import Footer from "../layouts/Footer";
import { GALLERY_SECTIONS } from "../data/galleryImages";

const toneClasses = {
  brand: "bg-brand text-white",
  accent: "bg-accent text-white",
  copy: "bg-copy text-white",
};

function GalleryCard({ item, index }) {
  const featured = index % 7 === 0;

  return (
    <ScrollReveal
      as="figure"
      x={index % 2 === 0 ? -42 : 42}
      mobileX={index % 2 === 0 ? -16 : 16}
      amount={0.08}
      delay={Math.min((index % 6) * 0.06, 0.3)}
      className={`group relative m-0 overflow-hidden rounded-lg bg-white shadow-[0_14px_34px_rgba(44,44,44,0.10)] ${
        featured ? "sm:col-span-2 sm:row-span-2" : ""
      }`}
    >
      <img
        className={`h-full min-h-[220px] w-full object-cover transition duration-500 group-hover:scale-105 ${
          featured ? "sm:min-h-[460px]" : ""
        }`}
        src={item.src}
        alt={item.alt}
        loading="lazy"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-copy/78 via-copy/42 to-transparent px-4 pt-12 pb-4 text-left text-white opacity-0 transition duration-300 group-hover:opacity-100">
        <span className="font-display text-xl">{item.title}</span>
      </figcaption>
    </ScrollReveal>
  );
}

function GallerySection({ section, index }) {
  return (
    <ScrollReveal
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
          <GalleryCard key={item.src} item={item} index={index} />
        ))}
      </div>
    </ScrollReveal>
  );
}

function GalleryPage() {
  const totalImages = GALLERY_SECTIONS.reduce((total, section) => total + section.images.length, 0);
  const heroImage = GALLERY_SECTIONS[2].images[0];

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-copy">
      <Navbar />

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

            <div className="grid grid-cols-3 gap-2 rounded-lg border border-white/16 bg-white/10 p-2 backdrop-blur-md">
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
              <div className="col-span-3 rounded-md bg-brand px-4 py-3 text-center text-sm font-bold text-white">
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
            <GallerySection key={section.id} section={section} index={index} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default GalleryPage;
