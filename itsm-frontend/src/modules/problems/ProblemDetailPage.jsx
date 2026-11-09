import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiErrorMessage } from "../../services/api.js";
import { changeProblemState, getProblem, registerRootCause } from "../../services/problems.js";

const nextStates = {
  NUEVO: "EN_ANALISIS",
  EN_ANALISIS: "ERROR_CONOCIDO",
  ERROR_CONOCIDO: "RESUELTO",
  RESUELTO: "CERRADO",
};

export default function ProblemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showCauseForm, setShowCauseForm] = useState(false);
  const [causeForm, setCauseForm] = useState({ causa_raiz: "", workaround: "" });

  async function refresh() {
    const result = await getProblem(id);
    setProblem(result.data);
  }

  useEffect(() => {
    refresh().catch((reason) => setError(apiErrorMessage(reason)));
  }, [id]);

  async function advance() {
    setBusy(true);
    setError("");
    try {
      await changeProblemState(id, nextStates[problem.estado]);
      await refresh();
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function saveCause(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await registerRootCause(id, causeForm);
      setCauseForm({ causa_raiz: "", workaround: "" });
      setShowCauseForm(false);
      await refresh();
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  if (!problem && !error) return <div className="page-content"><p className="muted">Cargando problema…</p></div>;
  return (
    <div className="page-content">
      <p className="breadcrumb"><Link to="/problemas">Problemas</Link> / Detalle</p>
      {error && <div className="alert alert-error" role="alert">{error}<button className="alert-dismiss" onClick={() => navigate("/problemas")}>Volver</button></div>}
      {problem && (
        <>
          <div className="page-heading">
            <div><p className="eyebrow">{problem.problema_id}</p><h1>{problem.titulo}</h1><p className="muted">{problem.descripcion || "Sin descripción."}</p></div>
            <div className="detail-actions">
              {problem.estado === "EN_ANALISIS" && <button className="button button-secondary" onClick={() => setShowCauseForm(!showCauseForm)}>{showCauseForm ? "Cancelar causa raíz" : "Registrar causa raíz"}</button>}
              {nextStates[problem.estado] && problem.estado !== "EN_ANALISIS" && <button className="button button-primary" disabled={busy} onClick={advance}>{busy ? "Actualizando…" : `Avanzar a ${nextStates[problem.estado].replaceAll("_", " ")}`}</button>}
            </div>
          </div>
          {showCauseForm && (
            <form className="panel form-grid cause-form" onSubmit={saveCause}>
              <div className="section-heading form-full"><div><p className="eyebrow">ERROR CONOCIDO</p><h2>Documentar análisis</h2></div></div>
              <label className="form-full">Causa raíz<textarea required rows="3" value={causeForm.causa_raiz} onChange={(event) => setCauseForm({ ...causeForm, causa_raiz: event.target.value })} /></label>
              <label className="form-full">Workaround / solución temporal<textarea required rows="2" value={causeForm.workaround} onChange={(event) => setCauseForm({ ...causeForm, workaround: event.target.value })} /></label>
              <div className="form-actions"><button className="button button-primary" disabled={busy}>{busy ? "Guardando…" : "Guardar y publicar evento"}</button></div>
            </form>
          )}
          <section className="detail-grid">
            <article className="panel detail-card"><p className="eyebrow">ESTADO ACTUAL</p><span className={`status-badge status-${problem.estado}`}>{problem.estado.replaceAll("_", " ")}</span><p className="detail-label">Prioridad</p><strong>{problem.prioridad}</strong><p className="detail-label">Responsable</p><strong>{problem.responsable_id || "Sin asignar"}</strong></article>
            <article className="panel detail-card"><p className="eyebrow">ANÁLISIS</p><p className="detail-label">Causa raíz</p><p>{problem.causa_raiz || "Pendiente de investigación."}</p><p className="detail-label">Workaround</p><p>{problem.workaround || "Aún no se ha documentado una solución temporal."}</p></article>
            <article className="panel detail-card detail-wide"><p className="eyebrow">INCIDENTES VINCULADOS</p>{problem.incidentes_ids?.length ? problem.incidentes_ids.map((incident) => <span className="incident-chip" key={incident}>{incident}</span>) : <p className="muted">No hay incidentes vinculados todavía.</p>}</article>
          </section>
        </>
      )}
    </div>
  );
}
