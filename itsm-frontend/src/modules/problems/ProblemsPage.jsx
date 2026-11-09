import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiErrorMessage } from "../../services/api.js";
import { createProblem, listProblems } from "../../services/problems.js";
import { ProblemRows } from "../dashboard/DashboardPage.jsx";

export default function ProblemsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [state, setState] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState("");
  const [cursor, setCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: "", descripcion: "", prioridad: "P3" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh(pageCursor = cursor) {
    const result = await listProblems({
      estado: state,
      prioridad: priority,
      responsable_id: assignee,
      limite: 20,
      siguiente: pageCursor,
    });
    setItems(result.data);
    setNextCursor(result.paginacion?.siguiente || null);
  }

  useEffect(() => {
    refresh(cursor).catch((reason) => setError(apiErrorMessage(reason)));
  }, [state, priority, assignee, cursor]);

  function resetFilters(updateFilter) {
    updateFilter();
    setCursor(null);
    setCursorHistory([]);
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createProblem(form, user.tenant_id);
      setForm({ titulo: "", descripcion: "", prioridad: "P3" });
      setShowForm(false);
      setCursor(null);
      setCursorHistory([]);
      await refresh(null);
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div><p className="eyebrow">GESTIÓN ITSM</p><h1>Problemas</h1><p className="muted">Investiga causas raíz y documenta soluciones conocidas.</p></div>
        <button className="button button-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancelar" : "+ Nuevo problema"}</button>
      </div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {showForm && (
        <form className="panel form-grid" onSubmit={submit}>
          <div className="section-heading form-full"><div><p className="eyebrow">REGISTRO</p><h2>Crear problema</h2></div></div>
          <label className="form-full">Título<input required maxLength={160} value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} /></label>
          <label className="form-full">Descripción<textarea rows="3" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} /></label>
          <label>Prioridad<select value={form.prioridad} onChange={(event) => setForm({ ...form, prioridad: event.target.value })}><option>P1</option><option>P2</option><option>P3</option><option>P4</option></select></label>
          <div className="form-actions"><button className="button button-primary" disabled={busy}>{busy ? "Guardando…" : "Crear problema"}</button></div>
        </form>
      )}
      <section className="panel">
        <div className="section-heading">
          <div><p className="eyebrow">REGISTRO</p><h2>Problemas <span className="count-pill">{items.length}</span></h2></div>
          <div className="filter-controls">
            <label className="filter-control"><span>Estado</span><select value={state} onChange={(event) => resetFilters(() => setState(event.target.value))}><option value="">Todos</option><option>NUEVO</option><option>EN_ANALISIS</option><option>ERROR_CONOCIDO</option><option>RESUELTO</option><option>CERRADO</option></select></label>
            <label className="filter-control"><span>Prioridad</span><select value={priority} onChange={(event) => resetFilters(() => setPriority(event.target.value))}><option value="">Todas</option><option>P1</option><option>P2</option><option>P3</option><option>P4</option></select></label>
            <label className="filter-control"><span>Responsable</span><input aria-label="ID del responsable" placeholder={`usr-${user.tenant_id}-…`} value={assignee} onChange={(event) => resetFilters(() => setAssignee(event.target.value.trim()))} /></label>
          </div>
        </div>
        <ProblemRows items={items} />
        <div className="pagination">
          <button className="button button-secondary" disabled={!cursorHistory.length} onClick={() => {
            const history = [...cursorHistory];
            const previousCursor = history.pop() ?? null;
            setCursorHistory(history);
            setCursor(previousCursor);
          }}>← Anterior</button>
          <span>Página {cursorHistory.length + 1}</span>
          <button className="button button-secondary" disabled={!nextCursor} onClick={() => {
            setCursorHistory([...cursorHistory, cursor]);
            setCursor(nextCursor);
          }}>Siguiente →</button>
        </div>
        <p className="list-footnote">Mostrando datos del tenant <strong>{user.tenant_id}</strong>.</p>
      </section>
      <p className="muted"><Link className="text-link" to="/">← Volver al dashboard</Link></p>
    </div>
  );
}
