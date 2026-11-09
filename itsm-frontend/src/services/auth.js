import axios from "axios";

export async function login(credentials) {
  const baseUrl = import.meta.env.VITE_API_AUTH;
  if (!baseUrl) throw new Error("Configura VITE_API_AUTH para usar el login real.");
  const { data } = await axios.post(`${baseUrl.replace(/\/$/, "")}/auth/login`, credentials);
  const token = data.data?.token || data.token;
  if (!token) throw new Error("La respuesta de autenticación no incluyó un token.");
  return {
    token,
    user: data.data?.usuario || data.usuario || {
      tenant_id: credentials.tenant_id,
      email: credentials.email,
      rol: "SOLICITANTE",
    },
  };
}
