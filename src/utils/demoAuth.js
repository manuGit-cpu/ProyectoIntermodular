export const DEMO_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@lagalana.com",
  password: "admin123",
  role: "admin",
  name: "Administrador La Galana",
};

export const DEMO_CLIENT_USER = {
  id: "00000000-0000-0000-0000-000000000002",
  email: "cliente@lagalana.com",
  password: "cliente123",
  role: "cliente",
  name: "Cliente La Galana",
};

const DEMO_USERS = [DEMO_USER, DEMO_CLIENT_USER];
const STORAGE_KEY = "lagalana_demo_user";

export function obtenerUsuarioDemo() {
  const storedUser = window.localStorage.getItem(STORAGE_KEY);

  return storedUser ? JSON.parse(storedUser) : null;
}

export function iniciarSesionUsuarioDemo(email, password) {
  const demoUser = DEMO_USERS.find(
    (user) => user.email === email && user.password === password
  );

  if (!demoUser) {
    return null;
  }

  const user = {
    id: demoUser.id,
    email: demoUser.email,
    user_metadata: {
      nombre: demoUser.name,
      rol: demoUser.role,
    },
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("app:demo-auth"));

  return user;
}

export function cerrarSesionUsuarioDemo() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("app:demo-auth"));
}
