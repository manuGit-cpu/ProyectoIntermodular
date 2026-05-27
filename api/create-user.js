import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

const PASSWORD_MIN_LENGTH = 8;

function sendJson(response, status, payload) {
  response.status(status).json(payload);
}

function normalizarEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function esEmailValido(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Metodo no permitido" });
    return;
  }

  if (!supabaseAdmin) {
    sendJson(response, 500, { error: "Supabase Admin no esta configurado" });
    return;
  }

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body;
  const email = normalizarEmail(body?.email);
  const password = String(body?.password || "");
  const nombre = String(body?.nombre || "").trim();

  if (!nombre || !email || !password) {
    sendJson(response, 400, { error: "Completa nombre, email y contrasena." });
    return;
  }

  if (!esEmailValido(email)) {
    sendJson(response, 400, { error: "Introduce un email valido." });
    return;
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    sendJson(response, 400, { error: `Usa una contrasena de al menos ${PASSWORD_MIN_LENGTH} caracteres.` });
    return;
  }

  const { data: usuariosExistentes, error: errorListarUsuarios } =
    await supabaseAdmin.auth.admin.listUsers();

  if (errorListarUsuarios) {
    sendJson(response, 500, { error: errorListarUsuarios.message });
    return;
  }

  const usuarioExistente = usuariosExistentes.users.find(
    (usuario) => normalizarEmail(usuario.email) === email,
  );

  if (usuarioExistente) {
    sendJson(response, 409, { error: "Ya existe una cuenta con ese email." });
    return;
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nombre,
      rol: "cliente",
    },
  });

  if (authError || !authData?.user) {
    sendJson(response, 500, { error: authError?.message || "No se pudo crear el usuario en Auth." });
    return;
  }

  const { error: profileError } = await supabaseAdmin.from("usuarios").insert({
    id: authData.user.id,
    nombre,
    email,
    telefono: null,
    rol: "cliente",
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    sendJson(response, 500, { error: profileError.message });
    return;
  }

  sendJson(response, 201, { ok: true, userId: authData.user.id });
}
