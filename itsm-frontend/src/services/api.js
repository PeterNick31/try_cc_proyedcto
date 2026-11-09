import axios from "axios";

export const http = axios.create({ timeout: 15000 });
let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

http.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem("itsm-auth") || "null");
  if (session?.token && session.token !== "demo-token") {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

http.interceptors.response.use(
  (result) => result,
  (error) => {
    if (error.response?.status === 401) unauthorizedHandler?.();
    if (error.response?.status === 403 && !error.response?.data?.error?.mensaje) {
      error.message = "No tienes permisos para realizar esta acción.";
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error) {
  return error.response?.data?.error?.mensaje || error.message || "Ocurrió un error inesperado.";
}
