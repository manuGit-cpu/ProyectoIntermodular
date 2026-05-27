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

function sendJson(response, status, payload) {
  response.status(status).json(payload);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Método no permitido" });
    return;
  }

  if (!supabaseAdmin) {
    sendJson(response, 500, { error: "Supabase Admin no está configurado" });
    return;
  }

  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    sendJson(response, 401, { error: "Sesión no encontrada" });
    return;
  }

  const { data: requesterData, error: requesterError } = await supabaseAdmin.auth.getUser(token);
  const requester = requesterData?.user;

  if (requesterError || !requester) {
    sendJson(response, 401, { error: "Sesión no válida" });
    return;
  }

  const profileFilters = [`id.eq.${requester.id}`];
  if (requester.email) profileFilters.push(`email.eq.${requester.email}`);

  const { data: requesterProfile, error: profileError } = await supabaseAdmin
    .from("usuarios")
    .select("id, email, rol")
    .or(profileFilters.join(","))
    .limit(1)
    .maybeSingle();

  if (profileError) {
    sendJson(response, 500, { error: profileError.message });
    return;
  }

  const requesterRole = String(requesterProfile?.rol || "").toLowerCase();
  if (!requesterRole.includes("admin")) {
    sendJson(response, 403, { error: "No tienes permiso para eliminar usuarios" });
    return;
  }

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body;
  const userId = String(body?.userId || "").trim();
  if (!userId) {
    sendJson(response, 400, { error: "Falta el id del usuario" });
    return;
  }

  if (userId === requester.id) {
    sendJson(response, 400, { error: "No puedes eliminar tu propia cuenta desde el dashboard" });
    return;
  }

  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authDeleteError) {
    sendJson(response, 500, { error: authDeleteError.message });
    return;
  }

  const { error: profileDeleteError } = await supabaseAdmin.from("usuarios").delete().eq("id", userId);

  if (profileDeleteError) {
    sendJson(response, 500, { error: profileDeleteError.message });
    return;
  }

  sendJson(response, 200, { ok: true });
}
