import { http } from "./api.js";
import { demoProblems } from "../modules/problems/demoData.js";

const demoMode =
  import.meta.env.VITE_DEMO_MODE === "true" ||
  (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE !== "false");
const storageKey = (tenantId) => `itsm-demo-problems-${tenantId}`;

function getDemoProblems() {
  const session = JSON.parse(localStorage.getItem("itsm-auth") || "null");
  const tenantId = session?.user?.tenant_id || "acme";
  const saved = JSON.parse(localStorage.getItem(storageKey(tenantId)) || "null");
  if (saved) return saved;
  return demoProblems.map((item) => ({
    ...item,
    tenant_id: tenantId,
    problema_id: item.problema_id.replaceAll("acme", tenantId),
    responsable_id: item.responsable_id.replaceAll("acme", tenantId),
    incidentes_ids: item.incidentes_ids.map((id) => id.replaceAll("acme", tenantId)),
  }));
}

function saveDemoProblems(items) {
  const session = JSON.parse(localStorage.getItem("itsm-auth") || "null");
  const tenantId = session?.user?.tenant_id || "acme";
  localStorage.setItem(storageKey(tenantId), JSON.stringify(items));
}

function baseUrl() {
  const url = import.meta.env.VITE_API_PROBLEMAS;
  if (!url) throw new Error("Configura VITE_API_PROBLEMAS para conectar el microservicio.");
  return url.replace(/\/$/, "");
}

export async function listProblems({
  estado = "",
  prioridad = "",
  responsable_id = "",
  limite = 20,
  siguiente = null,
} = {}) {
  if (demoMode) {
    const items = getDemoProblems().filter((item) =>
      (!estado || item.estado === estado)
      && (!prioridad || item.prioridad === prioridad)
      && (!responsable_id || item.responsable_id === responsable_id),
    );
    const offset = siguiente ? Number(siguiente) : 0;
    if (!Number.isInteger(offset) || offset < 0) throw new Error("Cursor de demostración inválido.");
    const end = offset + limite;
    return {
      data: items.slice(offset, end),
      paginacion: { limite, siguiente: end < items.length ? String(end) : null },
    };
  }
  const items = [];
  let cursor = siguiente;
  const seenCursors = new Set(cursor ? [cursor] : []);
  while (items.length < limite) {
    const { data } = await http.get(`${baseUrl()}/problemas`, {
      params: {
        estado: estado || undefined,
        prioridad: prioridad || undefined,
        responsable_id: responsable_id || undefined,
        limite: limite - items.length,
        siguiente: cursor || undefined,
      },
    });
    if (!Array.isArray(data.data)) {
      throw new Error("La respuesta de Problemas no contiene una lista de resultados válida.");
    }
    items.push(...data.data);
    cursor = data.paginacion?.siguiente || null;
    if (cursor && seenCursors.has(cursor)) {
      throw new Error("La API de Problemas repitió un cursor de paginación.");
    }
    if (cursor) seenCursors.add(cursor);
    if (!cursor) break;
  }
  return { data: items, paginacion: { limite, siguiente: cursor } };
}

export async function getProblem(id) {
  if (demoMode) {
    const item = getDemoProblems().find((problem) => problem.problema_id === id);
    if (!item) throw new Error("No se encontró el problema.");
    return { data: item };
  }
  const { data } = await http.get(`${baseUrl()}/problemas/${encodeURIComponent(id)}`);
  return data;
}

export async function getSummary() {
  if (demoMode) {
    const counts = {};
    for (const problem of getDemoProblems()) counts[problem.estado] = (counts[problem.estado] || 0) + 1;
    return { data: { por_estado: counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0) } };
  }
  const { data } = await http.get(`${baseUrl()}/problemas/resumen`);
  return data;
}

export async function createProblem(values, tenantId) {
  if (demoMode) {
    const activeTenant = JSON.parse(localStorage.getItem("itsm-auth") || "null")?.user?.tenant_id || "acme";
    if (tenantId !== activeTenant) throw new Error("El tenant de la sesión no coincide.");
    const items = getDemoProblems();
    const item = {
      ...values,
      tenant_id: tenantId,
      problema_id: `prb-${tenantId}-${Date.now()}`,
      estado: "NUEVO",
      incidentes_ids: [],
      creado_en: new Date().toISOString(),
    };
    saveDemoProblems([item, ...items]);
    return { data: item };
  }
  const { data } = await http.post(`${baseUrl()}/problemas`, values);
  return data;
}

export async function changeProblemState(id, estado) {
  if (demoMode) {
    const items = getDemoProblems();
    const item = items.find((problem) => problem.problema_id === id);
    if (!item) throw new Error("No se encontró el problema.");
    item.estado = estado;
    saveDemoProblems(items);
    return { data: item };
  }
  const { data } = await http.patch(`${baseUrl()}/problemas/${encodeURIComponent(id)}/estado`, { estado });
  return data;
}

export async function registerRootCause(id, values) {
  if (demoMode) {
    const items = getDemoProblems();
    const item = items.find((problem) => problem.problema_id === id);
    if (!item) throw new Error("No se encontró el problema.");
    item.causa_raiz = values.causa_raiz;
    item.workaround = values.workaround;
    item.estado = "ERROR_CONOCIDO";
    saveDemoProblems(items);
    return { data: item };
  }
  const { data } = await http.post(`${baseUrl()}/problemas/${encodeURIComponent(id)}/causa-raiz`, values);
  return data;
}
