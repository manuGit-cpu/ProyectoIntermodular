import { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
import Footer from "../layouts/Footer";
import { supabase } from "../supabase/client";
import { showAppAlert } from "../utils/appAlert";
import {
  DEMO_CLIENT_USER,
  DEMO_USER,
  getDemoUser,
  signInDemoUser,
  signOutDemoUser,
} from "../utils/demoAuth";
import { FEATURED_IMAGES } from "../data/laGalanaImages";

function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const demoUser = getDemoUser();

    if (demoUser) {
      setUserEmail(demoUser.email);
    }

    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? demoUser?.email ?? "");
    });
  }, []);

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();

    if (!supabase && isRegister) {
      showAppAlert({
        title: "Supabase no esta configurado",
        message: "El registro real necesita VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.",
        variant: "warning",
      });
      return;
    }

    if (!email || !password || (isRegister && !name)) {
      showAppAlert({
        message: "Completa todos los campos para continuar.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre: name,
              rol: "cliente",
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          await supabase.from("usuarios").upsert({
            id: data.user.id,
            nombre: name,
            email,
            rol: "cliente",
          });
        }

        showAppAlert({
          title: "Cuenta creada",
          message: "Ya puedes acceder con tus datos.",
          variant: "success",
        });
        setMode("login");
      } else {
        if (!supabase) {
          const demoUser = signInDemoUser(email, password);

          if (!demoUser) {
            throw new Error(
              `Usuarios demo: ${DEMO_USER.email} / ${DEMO_USER.password} o ${DEMO_CLIENT_USER.email} / ${DEMO_CLIENT_USER.password}`
            );
          }

          setUserEmail(demoUser.email);
          showAppAlert({
            title: "Sesion demo iniciada",
            message: "Has accedido con el usuario local temporal.",
            variant: "success",
          });
          window.history.pushState({}, "", "/#hero");
          window.dispatchEvent(new Event("app:navigate"));
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          const demoUser = signInDemoUser(email, password);

          if (!demoUser) throw error;

          setUserEmail(demoUser.email);
          showAppAlert({
            title: "Sesion demo iniciada",
            message: "Supabase no acepto el acceso, se uso el usuario local temporal.",
            variant: "success",
          });
          window.history.pushState({}, "", "/#hero");
          window.dispatchEvent(new Event("app:navigate"));
          return;
        }

        setUserEmail(data.user?.email ?? email);
        showAppAlert({
          title: "Sesion iniciada",
          message: "Has accedido correctamente.",
          variant: "success",
        });
        window.history.pushState({}, "", "/#reserva");
        window.dispatchEvent(new Event("app:navigate"));
      }
    } catch (error) {
      showAppAlert({
        title: "No se pudo acceder",
        message: error.message || "Revisa el email y la contrasena.",
        variant: "warning",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    signOutDemoUser();

    if (supabase) {
      await supabase.auth.signOut();
    }

    setUserEmail("");
    showAppAlert({
      title: "Sesion cerrada",
      message: "Has salido de tu cuenta.",
      variant: "success",
    });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-copy">
      <Navbar />

      <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 pt-28 pb-16 sm:px-6">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8f7f3_0%,#efe7d7_48%,#f8f7f3_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-copy" />

        <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/50 bg-white shadow-[0_28px_80px_rgba(44,44,44,0.18)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden min-h-[580px] overflow-hidden bg-copy p-10 text-white lg:block">
            <img
              className="absolute inset-0 h-full w-full object-cover opacity-45"
              src={FEATURED_IMAGES.login}
              alt=""
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-linear-to-t from-copy via-copy/72 to-copy/24" />
            <div className="relative z-10 flex h-full flex-col justify-end">
              <span className="mb-5 inline-flex w-max rounded-full bg-brand px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]">
                Casa Rural La Galana
              </span>
              <h1 className="font-display text-5xl leading-tight">Accede a tu espacio de reservas</h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-white/78">
                Consulta tus reservas y guarda tus datos para futuras visitas.
              </p>
            </div>
          </div>

          <div className="flex min-h-[580px] flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
            <div className="mx-auto w-full max-w-md">
              <a
                className="mb-8 inline-flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-full bg-[#eae6dc] p-2 no-underline"
                href="/#hero"
                aria-label="Inicio"
              >
                <span className="relative block h-full w-full rounded-full bg-[#989ca1]" aria-hidden="true">
                  <span className="absolute top-[16%] left-1/2 h-[32%] w-[32%] -translate-x-1/2 rounded-full bg-[#eae6dc]" />
                  <span className="absolute right-[17%] bottom-[9%] left-[17%] h-[42%] rounded-t-full bg-[#eae6dc]" />
                </span>
              </a>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-dark">
                  {isRegister ? "Crear cuenta" : "Inicio de sesion"}
                </p>
                <h2 className="mt-3 font-display text-4xl leading-tight text-copy sm:text-5xl">
                  {isRegister ? "Reserva con tu cuenta" : "Bienvenido de nuevo"}
                </h2>
                <p className="mt-4 text-sm leading-6 text-muted">
                  {userEmail
                    ? `Sesion activa como ${userEmail}.`
                    : `Demo admin: ${DEMO_USER.email} / ${DEMO_USER.password}. Demo cliente: ${DEMO_CLIENT_USER.email} / ${DEMO_CLIENT_USER.password}.`}
                </p>
              </div>

              {userEmail ? (
                <div className="mt-8 grid gap-3">
                  <a
                    className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-bold text-white no-underline transition hover:bg-accent-dark"
                    href="/#reserva"
                  >
                    Ver reservas
                  </a>
                  <button
                    className="h-12 rounded-full border border-brand/22 bg-white px-6 text-sm font-bold text-copy transition hover:border-brand/45 hover:text-brand-dark"
                    type="button"
                    onClick={handleLogout}
                  >
                    Cerrar sesion
                  </button>
                </div>
              ) : (
                <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
                  {isRegister && (
                    <label className="grid gap-2 text-sm font-semibold text-copy">
                      Nombre
                      <input
                        className="h-12 rounded-full border border-brand/18 bg-[#f8f7f3] px-5 text-sm outline-none transition focus:border-brand focus:bg-white"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="name"
                        placeholder="Tu nombre"
                      />
                    </label>
                  )}

                  <label className="grid gap-2 text-sm font-semibold text-copy">
                    Email
                    <input
                      className="h-12 rounded-full border border-brand/18 bg-[#f8f7f3] px-5 text-sm outline-none transition focus:border-brand focus:bg-white"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      placeholder="tu@email.com"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-copy">
                    Contrasena
                    <input
                      className="h-12 rounded-full border border-brand/18 bg-[#f8f7f3] px-5 text-sm outline-none transition focus:border-brand focus:bg-white"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={isRegister ? "new-password" : "current-password"}
                      placeholder="Tu contrasena"
                    />
                  </label>

                  <button
                    className="mt-2 h-12 rounded-full bg-brand px-6 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-65"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Procesando..." : isRegister ? "Crear cuenta" : "Entrar"}
                  </button>

                  <button
                    className="h-11 rounded-full border border-accent/20 bg-accent/8 px-6 text-sm font-bold text-accent-dark transition hover:border-accent/35 hover:bg-accent/14"
                    type="button"
                    onClick={() => setMode(isRegister ? "login" : "register")}
                  >
                    {isRegister ? "Ya tengo cuenta" : "Crear cuenta nueva"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LoginPage;
