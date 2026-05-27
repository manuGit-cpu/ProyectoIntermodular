import { useEffect, useState } from "react";
import BarraNavegacion from "../components/NavBar";
import PiePagina from "../layouts/Footer";
import { supabase } from "../supabase/client";
import { mostrarAlertaApp } from "../utils/appAlert";

const PASSWORD_MIN_LENGTH = 8;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const IMAGE_BASE_PATH = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/la-galana`
  : "/images/la-galana";
const LOGIN_IMAGE = `${IMAGE_BASE_PATH}/interior/rincon-descanso.webp`;

function normalizarEmail(value) {
  return value.trim().toLowerCase();
}

function esEmailValido(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function validarPerfilUsuario(usuario) {
  if (!supabase || (!usuario?.id && !usuario?.email)) {
    return false;
  }

  const filtros = [];
  if (usuario.id) filtros.push(`id.eq.${usuario.id}`);
  if (usuario.email) filtros.push(`email.eq.${usuario.email}`);

  const { data: perfilExistente, error } = await supabase
    .from("usuarios")
    .select("id")
    .or(filtros.join(","))
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(perfilExistente);
}

async function crearPerfilUsuario(usuario, { nombre, rol = "cliente" } = {}) {
  if (!supabase || !usuario?.id || !usuario?.email) {
    throw new Error("No se pudo identificar el usuario creado.");
  }

  const filtros = [`id.eq.${usuario.id}`, `email.eq.${usuario.email}`];
  const { data: perfilExistente, error: errorPerfil } = await supabase
    .from("usuarios")
    .select("id")
    .or(filtros.join(","))
    .limit(1)
    .maybeSingle();

  if (errorPerfil) throw errorPerfil;
  if (perfilExistente) return perfilExistente;

  const { data: perfilCreado, error } = await supabase
    .from("usuarios")
    .insert({
      id: usuario.id,
      nombre: nombre || usuario.user_metadata?.nombre || usuario.email,
      email: usuario.email,
      telefono: null,
      rol,
    })
    .select("id")
    .single();

  if (error) throw error;
  return perfilCreado;
}

async function crearCuentaClienteDesdeSupabase({ email, password, nombre }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre,
        rol: "cliente",
      },
    },
  });

  if (error) throw error;

  if (data.user?.identities?.length === 0) {
    throw new Error("Ya existe una cuenta con ese email.");
  }

  if (data.session && data.user) {
    await crearPerfilUsuario(data.user, { nombre, rol: "cliente" });
    await supabase.auth.signOut();
  }

  return { ok: true, userId: data.user?.id };
}

async function crearCuentaCliente({ email, password, nombre }) {
  const response = await fetch("/api/create-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, nombre }),
  });

  if (!response.ok) {
    const textoRespuesta = await response.text().catch(() => "");
    const esApiNoDisponible = response.status === 404 || textoRespuesta.trim().startsWith("<!doctype");

    if (esApiNoDisponible) {
      return crearCuentaClienteDesdeSupabase({ email, password, nombre });
    }

    const payload = (() => {
      try {
        return textoRespuesta ? JSON.parse(textoRespuesta) : {};
      } catch {
        return {};
      }
    })();
    throw new Error(payload.error || "No se pudo crear la cuenta.");
  }

  return response.json();
}

function obtenerMensajeError(error) {
  const message = error?.message || "";

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "El email o la contraseña no son correctos.";
  }

  if (message.toLowerCase().includes("user already registered")) {
    return "Ya existe una cuenta con ese email.";
  }

  if (message.toLowerCase().includes("password should be at least")) {
    return `Usa una contraseña de al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }

  if (message.toLowerCase().includes("email not confirmed")) {
    return "El email todavía no está confirmado. Revisa tu correo y confirma la cuenta antes de iniciar sesión.";
  }

  return message || "Revisa el email y la contraseña.";
}

function PaginaLogin() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? "");
    });

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? "");
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  const isRegister = mode === "register";

  async function manejarEnvio(event) {
    event.preventDefault();

    if (!supabase) {
      mostrarAlertaApp({
        title: "Supabase no está configurado",
        message: "El acceso real necesita VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.",
        variant: "warning",
      });
      return;
    }

    const emailNormalizado = normalizarEmail(email);
    const nombreNormalizado = name.trim();

    if (!emailNormalizado || !password || (isRegister && !nombreNormalizado)) {
      mostrarAlertaApp({
        message: "Completa todos los campos para continuar.",
        variant: "warning",
      });
      return;
    }

    if (!esEmailValido(emailNormalizado)) {
      mostrarAlertaApp({
        title: "Email no válido",
        message: "Introduce un email con un formato correcto.",
        variant: "warning",
      });
      return;
    }

    if (isRegister && password.length < PASSWORD_MIN_LENGTH) {
      mostrarAlertaApp({
        title: "Contraseña demasiado corta",
        message: `Usa al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
        variant: "warning",
      });
      return;
    }

    if (isRegister && password !== passwordConfirmation) {
      mostrarAlertaApp({
        title: "Las contraseñas no coinciden",
        message: "Repite la misma contraseña para crear la cuenta.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await crearCuentaCliente({
          email: emailNormalizado,
          password,
          nombre: nombreNormalizado,
        });

        setPassword("");
        setPasswordConfirmation("");
        setName("");
        mostrarAlertaApp({
          title: "Cuenta creada",
          message: "Tu usuario se ha creado correctamente. Ya puedes iniciar sesion.",
          variant: "success",
        });
        setMode("login");
        return;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailNormalizado,
          password,
        });

        if (error) throw error;

        let perfilExiste = await validarPerfilUsuario({
          id: data.user.id,
          email: data.user.email ?? emailNormalizado,
        });

        if (!perfilExiste) {
          await crearPerfilUsuario(data.user, {
            nombre: data.user.user_metadata?.nombre || data.user.email || emailNormalizado,
            rol: data.user.user_metadata?.rol || "cliente",
          });
          perfilExiste = true;
        }

        if (!perfilExiste) {
          await supabase.auth.signOut();
          setUserEmail("");
          mostrarAlertaApp({
            title: "Cuenta sin perfil",
            message: "Tu usuario no existe en la tabla de usuarios de Supabase. Contacta con el administrador.",
            variant: "warning",
          });
          return;
        }

        setUserEmail(data.user?.email ?? emailNormalizado);
        setPassword("");
        mostrarAlertaApp({
          title: "Sesión iniciada",
          message: "Has accedido correctamente.",
          variant: "success",
        });
        window.history.pushState({}, "", "/#reserva");
        window.dispatchEvent(new Event("app:navigate"));
      }
    } catch (error) {
      mostrarAlertaApp({
        title: "No se pudo acceder",
        message: obtenerMensajeError(error),
        variant: "warning",
      });
    } finally {
      setLoading(false);
    }
  }

  async function manejarCierreSesion() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setUserEmail("");
    mostrarAlertaApp({
      title: "Sesión cerrada",
      message: "Has salido de tu cuenta.",
      variant: "success",
    });
  }

  function cambiarModo() {
    setMode(isRegister ? "login" : "register");
    setPassword("");
    setPasswordConfirmation("");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-copy">
      <BarraNavegacion />

      <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 pt-28 pb-16 sm:px-6">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8f7f3_0%,#efe7d7_48%,#f8f7f3_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-copy" />

        <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/50 bg-white shadow-[0_28px_80px_rgba(44,44,44,0.18)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden min-h-[580px] overflow-hidden bg-copy p-10 text-white lg:block">
            <img
              className="absolute inset-0 h-full w-full object-cover opacity-45"
              src={LOGIN_IMAGE}
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
                  {isRegister ? "Crear cuenta" : "Inicio de sesión"}
                </p>
                <h2 className="mt-3 font-display text-4xl leading-tight text-copy sm:text-5xl">
                  {isRegister ? "Reserva con tu cuenta" : "Bienvenido de nuevo"}
                </h2>
                <p className="mt-4 text-sm leading-6 text-muted">
                  {userEmail
                    ? `Sesión activa como ${userEmail}.`
                    : "Accede con tu cuenta o crea una nueva para gestionar tus reservas."}
                </p>
              </div>

              {userEmail ? (
                <div className="mt-8 grid gap-3">
                  <a
                    className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-bold text-white no-underline transition hover:bg-accent-dark"
                    href="/mis-reservas"
                  >
                    Ver reservas
                  </a>
                  <button
                    className="h-12 rounded-full border border-brand/22 bg-white px-6 text-sm font-bold text-copy transition hover:border-brand/45 hover:text-brand-dark"
                    type="button"
                    onClick={manejarCierreSesion}
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <form className="mt-8 grid gap-4" onSubmit={manejarEnvio}>
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
                    Contraseña
                    <input
                      className="h-12 rounded-full border border-brand/18 bg-[#f8f7f3] px-5 text-sm outline-none transition focus:border-brand focus:bg-white"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={isRegister ? "new-password" : "current-password"}
                      placeholder="Tu contraseña"
                    />
                  </label>

                  {isRegister && (
                    <label className="grid gap-2 text-sm font-semibold text-copy">
                      Repetir contraseña
                      <input
                        className="h-12 rounded-full border border-brand/18 bg-[#f8f7f3] px-5 text-sm outline-none transition focus:border-brand focus:bg-white"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(event) => setPasswordConfirmation(event.target.value)}
                        autoComplete="new-password"
                        placeholder="Repite tu contraseña"
                      />
                    </label>
                  )}

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
                    onClick={cambiarModo}
                  >
                    {isRegister ? "Ya tengo cuenta" : "Crear cuenta nueva"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <PiePagina />
    </div>
  );
}

export default PaginaLogin;
