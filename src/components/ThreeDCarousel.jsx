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

/**
 * Carrusel 3D (basado en patrón tipo ThreeDCarousel + Tailwind → CSS propio).
 */
export default function ThreeDCarousel({
  items,
  autoRotate = true,
  rotateInterval = 4000,
  cardHeight = 500,
  linkLabel = "Ver más",
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
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
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
    const n = items.length;
    if (index === active) return "carousel-3d-slide carousel-3d-slide--active";
    if (index === (active + 1) % n) return "carousel-3d-slide carousel-3d-slide--next";
    if (index === (active - 1 + n) % n) return "carousel-3d-slide carousel-3d-slide--prev";
    return "carousel-3d-slide carousel-3d-slide--hidden";
  };

  return (
    <section className="carousel-3d-root" aria-roledescription="carousel">
      <div className="carousel-3d-inner">
        <div
          className="carousel-3d-viewport"
          style={{ "--carousel-card-height": `${cardHeight}px` }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          ref={carouselRef}
        >
          <div className="carousel-3d-stage">
            {items.map((item, index) => (
              <div key={item.id} className={slideClass(index)}>
                <article className="carousel-3d-card">
                  <div
                    className="carousel-3d-card-hero"
                    style={{
                      backgroundImage: `url(${item.imageUrl})`,
                    }}
                  >
                    <div className="carousel-3d-card-hero-overlay" />
                    <div className="carousel-3d-card-hero-text">
                      <h3 className="carousel-3d-card-brand">{item.brand.toUpperCase()}</h3>
                      <div className="carousel-3d-card-rule" />
                      <p className="carousel-3d-card-title-sm">{item.title}</p>
                    </div>
                  </div>

                  <div className="carousel-3d-card-body">
                    <h3 className="carousel-3d-card-title">{item.title}</h3>
                    <p className="carousel-3d-card-sub">{item.brand}</p>
                    <p className="carousel-3d-card-desc">{item.description}</p>

                    <div className="carousel-3d-card-footer">
                      <div className="carousel-3d-tags">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="carousel-3d-tag">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <a
                        href={item.link}
                        className="carousel-3d-more"
                        onClick={() => {
                          if (item.link.startsWith("/")) {
                            window.scrollTo(0, 0);
                          }
                        }}
                      >
                        <span>{linkLabel}</span>
                        <IconArrowRight className="carousel-3d-more-icon" />
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
                className="carousel-3d-nav carousel-3d-nav--prev"
                onClick={() => setActive((prev) => (prev - 1 + items.length) % items.length)}
                aria-label="Anterior"
              >
                <IconChevronLeft className="carousel-3d-nav-icon" />
              </button>
              <button
                type="button"
                className="carousel-3d-nav carousel-3d-nav--next"
                onClick={() => setActive((prev) => (prev + 1) % items.length)}
                aria-label="Siguiente"
              >
                <IconChevronRight className="carousel-3d-nav-icon" />
              </button>
            </>
          )}

          <div className="carousel-3d-dots" role="tablist" aria-label="Diapositivas">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={active === idx}
                className={`carousel-3d-dot${active === idx ? " carousel-3d-dot--active" : ""}`}
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
