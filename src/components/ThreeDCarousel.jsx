import { useEffect, useRef, useState } from "react";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}

function IconChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function IconChevronRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function IconArrowRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function ThreeDCarousel({
  items,
  autoRotate = true,
  rotateInterval = 4000,
  cardHeight = 500,
  linkLabel = "Ver mÃ¡s",
  isMobileSwipe = true,
}) {
  const [active, setActive] = useState(0);
  const carouselRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const isMobile = useIsMobile();
  const minSwipeDistance = 50;

  useEffect(() => {
    if (autoRotate && isInView && !isHovering) {
      const interval = setInterval(() => {
        setActive((prev) => (prev + 1) % items.length);
      }, rotateInterval);
      return () => clearInterval(interval);
    }
  }, [isInView, isHovering, autoRotate, rotateInterval, items.length]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      threshold: 0.2,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onTouchStart = (e) => {
    if (!isMobileSwipe) return;
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const onTouchMove = (e) => {
    if (!isMobileSwipe) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!isMobileSwipe || touchStart == null || touchEnd == null) return;

    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) {
      setActive((prev) => (prev + 1) % items.length);
    } else if (distance < -minSwipeDistance) {
      setActive((prev) => (prev - 1 + items.length) % items.length);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const slideClass = (index) => {
    const total = items.length;
    const baseClass =
      "absolute top-1/2 left-1/2 w-full max-w-[28rem] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 transition duration-500 ease-out";

    if (index === active) {
      return `${baseClass} z-20 scale-100 pointer-events-auto opacity-100`;
    }

    if (index === (active + 1) % total) {
      return `${baseClass} z-10 translate-x-[-10%] -translate-y-1/2 scale-95 opacity-60 max-md:translate-x-[-50%] max-md:scale-[0.92] max-md:opacity-35`;
    }

    if (index === (active - 1 + total) % total) {
      return `${baseClass} z-10 -translate-x-[90%] -translate-y-1/2 scale-95 opacity-60 max-md:translate-x-[-50%] max-md:scale-[0.92] max-md:opacity-35`;
    }

    return `${baseClass} z-0 scale-90 opacity-0`;
  };

  return (
    <section className="mt-6 w-full" aria-roledescription="carousel">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-0">
        <div
          className="relative h-[520px] overflow-hidden rounded-xl md:h-[550px] lg:h-[440px]"
          style={{ "--carousel-card-height": `${cardHeight}px` }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          ref={carouselRef}
        >
          <div className="absolute inset-0 flex items-center justify-center [perspective:1200px]">
            {items.map((item, index) => (
              <div key={item.id} className={slideClass(index)}>
                <article className="flex min-h-[var(--carousel-card-height)] flex-col overflow-hidden rounded-xl border border-black/8 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] transition hover:shadow-[0_14px_48px_rgba(0,0,0,0.14)]">
                  <div
                    className="relative flex h-48 items-center justify-center overflow-hidden bg-black bg-cover bg-center bg-no-repeat p-6"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  >
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative z-10 text-center text-white">
                      <h3 className="font-display text-xl font-bold">{item.brand.toUpperCase()}</h3>
                      <div className="mx-auto my-2 h-[3px] w-12 rounded-full bg-white" />
                      <p className="text-sm text-white/95">{item.title}</p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6 text-left">
                    <h3 className="font-display text-xl font-bold text-copy">{item.title}</h3>
                    <p className="mb-2 text-sm font-semibold text-muted">{item.brand}</p>
                    <p className="flex-1 text-sm leading-6 text-muted">{item.description}</p>

                    <div className="mt-4">
                      <div className="mb-4 flex flex-wrap gap-2">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-full border border-stone-200 bg-surface px-2 py-1 text-xs text-muted [animation:carousel-tag-pulse_3s_ease-in-out_infinite]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <a
                        href={item.link}
                        className="group relative inline-flex items-center gap-1.5 border-b-2 border-transparent pb-0.5 text-sm text-muted transition hover:border-brand hover:text-copy"
                        onClick={() => {
                          if (item.link.startsWith("/")) {
                            window.scrollTo(0, 0);
                          }
                        }}
                      >
                        <span>{linkLabel}</span>
                        <IconArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>

          {!isMobile && (
            <>
              <button
                type="button"
                className="absolute top-1/2 left-4 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-muted shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition hover:scale-105 hover:bg-white"
                onClick={() => setActive((prev) => (prev - 1 + items.length) % items.length)}
                aria-label="Anterior"
              >
                <IconChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                className="absolute top-1/2 right-4 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-muted shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition hover:scale-105 hover:bg-white"
                onClick={() => setActive((prev) => (prev + 1) % items.length)}
                aria-label="Siguiente"
              >
                <IconChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            className="absolute right-0 bottom-6 left-0 z-30 flex items-center justify-center gap-3"
            role="tablist"
            aria-label="Diapositivas"
          >
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={active === idx}
                className={`h-2 rounded-full transition ${
                  active === idx ? "w-5 bg-brand" : "w-2 bg-stone-300 hover:bg-stone-400"
                }`}
                onClick={() => setActive(idx)}
                aria-label={`Ir a la imagen ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
