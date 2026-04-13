import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const PillNav = ({
  logo,
  logoAlt = "Logo",
  logoHref,
  items,
  activeHref,
  className = "",
  ease = "power3.easeOut",
  baseColor = "#fff",
  pillColor = "#060010",
  hoveredPillTextColor = "#060010",
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = (w * w / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector(".pill-label");
        const hoverLabel = pill.querySelector(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        }

        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(hoverLabel, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, {
          scale: 1,
          duration: 0.6,
          ease,
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: "hidden" });
        gsap.to(navItems, {
          width: "auto",
          duration: 0.6,
          ease,
        });
      }
    }

    return () => window.removeEventListener("resize", onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (index) => {
    const tl = tlRefs.current[index];
    if (!tl) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (index) => {
    const tl = tlRefs.current[index];
    if (!tl) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const toggleMobileMenu = () => {
    const nextState = !isMobileMenuOpen;
    setIsMobileMenuOpen(nextState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (nextState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (nextState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: "top center",
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: "top center",
          onComplete: () => {
            gsap.set(menu, { visibility: "hidden" });
          },
        });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    ["--base"]: baseColor,
    ["--pill-bg"]: pillColor,
    ["--hover-text"]: hoveredPillTextColor,
    ["--pill-text"]: resolvedPillTextColor,
  };

  const homeHref = logoHref ?? items?.[0]?.href ?? "#";

  return (
    <div className="pointer-events-auto relative w-full md:w-auto">
      <nav
        className={`flex w-full items-center justify-between gap-3 md:w-max md:justify-start ${className}`}
        aria-label="Primary"
        style={cssVars}
      >
        <a
          className="inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--base)] p-2"
          href={homeHref}
          aria-label="Inicio"
          onMouseEnter={handleLogoEnter}
          ref={(el) => {
            logoRef.current = el;
          }}
        >
          <img
            src={logo}
            alt={logoAlt}
            ref={logoImgRef}
            className="block h-full w-full object-cover"
          />
        </a>

        <div
          className="relative hidden h-[50px] items-center rounded-full bg-[var(--base)] md:flex"
          ref={navItemsRef}
        >
          <ul className="m-0 flex h-full list-none items-stretch gap-[10px] p-2" role="menubar">
            {items.map((item, index) => (
              <li key={`pill-${index}-${item.label}`} role="none" className="flex h-full">
                <a
                  role="menuitem"
                  href={item.href}
                  className={`group relative inline-flex h-full items-center justify-center overflow-hidden rounded-full px-5 text-[13px] font-semibold uppercase leading-none tracking-[0.2px] whitespace-nowrap no-underline ${
                    item.variant
                      ? "bg-accent text-[#f4f6ef]"
                      : "bg-[var(--pill-bg)] text-[var(--pill-text)]"
                  } ${
                    activeHref === item.href
                      ? "is-active after:absolute after:-bottom-1.5 after:left-1/2 after:z-[4] after:h-3 after:w-3 after:-translate-x-1/2 after:rounded-full after:bg-brand"
                      : ""
                  }`}
                  aria-label={item.ariaLabel || item.label}
                  onMouseEnter={() => handleEnter(index)}
                  onMouseLeave={() => handleLeave(index)}
                >
                  <span
                    className={`hover-circle absolute left-1/2 bottom-0 z-[1] block rounded-full ${
                      item.variant ? "bg-brand" : "bg-[var(--base)]"
                    }`}
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[index] = el;
                    }}
                  />
                  <span className="relative z-[2] inline-block leading-none">
                    <span className="pill-label relative z-[2] inline-block leading-none">
                      {item.label}
                    </span>
                    <span
                      className={`pill-label-hover absolute top-0 left-0 z-[3] inline-block ${
                        item.variant ? "text-white" : "text-copy"
                      }`}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <button
          className="relative flex h-[50px] w-[50px] flex-col items-center justify-center gap-1 rounded-full border-0 bg-[var(--base)] p-0 md:hidden"
          type="button"
          onClick={toggleMobileMenu}
          aria-label="Abrir o cerrar menu"
          aria-expanded={isMobileMenuOpen}
          ref={hamburgerRef}
        >
          <span className="hamburger-line h-0.5 w-4 rounded-[1px] bg-[var(--pill-bg)]" />
          <span className="hamburger-line h-0.5 w-4 rounded-[1px] bg-[var(--pill-bg)]" />
        </button>
      </nav>

      <div
        className="invisible absolute top-14 right-4 left-4 z-[998] rounded-[27px] bg-[var(--base)] opacity-0 shadow-[0_8px_32px_rgba(0,0,0,0.12)] md:hidden"
        ref={mobileMenuRef}
        style={cssVars}
      >
        <ul className="m-0 flex list-none flex-col gap-[3px] p-[3px]">
          {items.map((item, index) => (
            <li key={`pill-mobile-${index}-${item.label}`}>
              <a
                href={item.href}
                className={`block rounded-[50px] px-4 py-3 text-base font-medium no-underline transition ${
                  item.variant
                    ? "bg-accent text-[#f4f6ef] hover:bg-accent-dark hover:text-white"
                    : "bg-[var(--pill-bg)] text-[var(--pill-text)] hover:bg-[var(--base)] hover:text-[var(--hover-text)]"
                } ${activeHref === item.href ? "ring-2 ring-brand/30" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
