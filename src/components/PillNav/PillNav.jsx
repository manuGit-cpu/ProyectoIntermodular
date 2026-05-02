import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const NavegacionPildora = ({
  logo,
  logoAlt = "Logo",
  logoHref,
  items,
  activeHref,
  userHref = "/login",
  userActive = false,
  user = null,
  userRole = "cliente",
  onLogout,
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const calcularDiseno = () => {
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

    calcularDiseno();

    const alRedimensionar = () => calcularDiseno();
    window.addEventListener("resize", alRedimensionar);

    if (document.fonts?.ready) {
      document.fonts.ready.then(calcularDiseno).catch(() => {});
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

    return () => window.removeEventListener("resize", alRedimensionar);
  }, [items, ease, initialLoadAnimation]);

  useEffect(() => {
    const manejarClickDocumento = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", manejarClickDocumento);

    return () => document.removeEventListener("mousedown", manejarClickDocumento);
  }, []);

  const manejarEntrada = (index) => {
    const tl = tlRefs.current[index];
    if (!tl) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };

  const manejarSalida = (index) => {
    const tl = tlRefs.current[index];
    if (!tl) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const manejarEntradaLogo = () => {
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

  const alternarMenuMovil = () => {
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
  const isLoggedIn = Boolean(user);
  const userLabel = user?.user_metadata?.nombre || user?.email || "Usuario";
  const userInitial = userLabel.trim().charAt(0).toUpperCase() || "U";
  const roleLabel =
    userRole === "admin" || userRole === "administrador"
      ? "Administrador"
      : userRole === "empleado"
        ? "Empleado"
        : "Cliente";
  const primaryUserHref =
    userRole === "admin" || userRole === "administrador" ? "/dashboard" : "/#reserva";

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
          onMouseEnter={manejarEntradaLogo}
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
                  target={item.target}
                  rel={item.rel}
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
                  onMouseEnter={() => manejarEntrada(index)}
                  onMouseLeave={() => manejarSalida(index)}
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

        <div className="relative" ref={userMenuRef}>
          {isLoggedIn ? (
            <button
              className="inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-full border-0 bg-brand p-1.5 text-white shadow-[0_10px_24px_rgba(194,168,120,0.28)] transition hover:bg-brand-dark hover:scale-105"
              type="button"
              aria-label="Abrir menu de usuario"
              aria-expanded={isUserMenuOpen}
              onClick={() => setIsUserMenuOpen((open) => !open)}
            >
              <span className="flex h-full w-full items-center justify-center rounded-full border border-white/35 bg-brand-dark text-sm font-extrabold uppercase">
                {userInitial}
              </span>
            </button>
          ) : (
            <a
              className={`inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--base)] p-2 no-underline transition hover:scale-105 ${
                userActive ? "ring-2 ring-brand/45" : ""
              }`}
              href={userHref}
              aria-label="Acceder a usuario"
            >
              <span className="relative block h-full w-full rounded-full bg-[#989ca1]" aria-hidden="true">
                <span className="absolute top-[16%] left-1/2 h-[32%] w-[32%] -translate-x-1/2 rounded-full bg-[var(--base)]" />
                <span className="absolute right-[17%] bottom-[9%] left-[17%] h-[42%] rounded-t-full bg-[var(--base)]" />
              </span>
            </a>
          )}

          {isLoggedIn && (
            <div
              className={`absolute top-[58px] right-0 z-[999] w-[230px] rounded-lg border border-brand/14 bg-white p-2 text-copy shadow-[0_18px_46px_rgba(44,44,44,0.18)] transition ${
                isUserMenuOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0"
              }`}
            >
              <div className="border-b border-brand/12 px-3 py-3">
                <p className="m-0 truncate text-sm font-bold text-copy">{userLabel}</p>
                <p className="m-0 mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark">
                  {roleLabel}
                </p>
              </div>

              <a
                className="mt-2 block rounded-md px-3 py-2.5 text-sm font-semibold text-copy no-underline transition hover:bg-brand/12 hover:text-brand-dark"
                href={primaryUserHref}
                onClick={() => setIsUserMenuOpen(false)}
              >
                {userRole === "admin" || userRole === "administrador" ? "Dashboard" : "Ver mis reservas"}
              </a>

              <button
                className="block w-full rounded-md border-0 bg-transparent px-3 py-2.5 text-left text-sm font-semibold text-muted transition hover:bg-copy/8 hover:text-copy"
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onLogout?.();
                }}
              >
                Cerrar sesion
              </button>
            </div>
          )}
        </div>

        <button
          className="relative flex h-[50px] w-[50px] flex-col items-center justify-center gap-1 rounded-full border-0 bg-[var(--base)] p-0 md:hidden"
          type="button"
          onClick={alternarMenuMovil}
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
                target={item.target}
                rel={item.rel}
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

export default NavegacionPildora;
