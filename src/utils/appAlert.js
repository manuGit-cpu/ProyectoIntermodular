const STACK_ID = "appAlertStack";

function asegurarPilaAlertas() {
  let stack = document.getElementById(STACK_ID);

  if (stack) return stack;

  stack = document.createElement("div");
  stack.id = STACK_ID;
  stack.className = "app-alert-stack";
  stack.setAttribute("aria-live", "polite");
  stack.setAttribute("aria-atomic", "true");
  document.body.appendChild(stack);

  return stack;
}

function obtenerTextoAlerta(variant) {
  if (variant === "success") {
    return {
      badge: "Correcto",
      title: "Operacion completada",
      icon:
        '<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />',
    };
  }

  if (variant === "warning") {
    return {
      badge: "Revision",
      title: "Necesitas revisar este dato",
      icon:
        '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />',
    };
  }

  return {
    badge: "Aviso",
    title: "Hay un dato obligatorio pendiente",
    icon:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />',
  };
}

function escaparHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function mostrarAlertaApp(options) {
  const { title = "", message = "", variant = "error", duration = 4500 } = options || {};

  const stack = asegurarPilaAlertas();
  const copy = obtenerTextoAlerta(variant);
  const toast = document.createElement("section");
  const titleText = title || copy.title;

  toast.className = "app-alert app-alert-" + variant;
  toast.setAttribute("role", "alert");

  toast.innerHTML =
    '<div class="app-alert-accent"></div>' +
    '<div class="app-alert-content">' +
    '  <div class="app-alert-header">' +
    '    <span class="app-alert-badge">' +
    escaparHtml(copy.badge) +
    "</span>" +
    '    <button type="button" class="app-alert-close" aria-label="Cerrar aviso">' +
    '      <span aria-hidden="true">&times;</span>' +
    "    </button>" +
    "  </div>" +
    '  <div class="app-alert-body">' +
    '    <div class="app-alert-icon" aria-hidden="true">' +
    '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
    copy.icon +
    "      </svg>" +
    "    </div>" +
    "    <div>" +
    '      <p class="app-alert-title">' +
    escaparHtml(titleText) +
    "</p>" +
    '      <p class="app-alert-message">' +
    escaparHtml(message) +
    "</p>" +
    "    </div>" +
    "  </div>" +
    "</div>";

  function eliminarAviso() {
    if (!toast.isConnected) return;

    toast.classList.add("app-alert-leave");
    window.setTimeout(function () {
      if (toast.isConnected) {
        toast.remove();
      }
    }, 220);
  }

  const closeButton = toast.querySelector(".app-alert-close");
  if (closeButton) {
    closeButton.addEventListener("click", eliminarAviso);
  }

  stack.appendChild(toast);

  if (duration > 0) {
    window.setTimeout(eliminarAviso, duration);
  }
}
