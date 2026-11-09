import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiErrorMessage } from "../../services/api.js";
import { getSummary, listProblems } from "../../services/problems.js";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getSummary(), listProblems({ limite: 4 })])
      .then(([counts, problems]) => {
        setSummary(counts.data);
        setRecent(problems.data);
      })
      .catch((reason) => setError(apiErrorMessage(reason)));
  }, []);

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">VISTA GENERAL</p>
          <h1>Hola, {user?.nombre?.split(" ")[0] || "equipo"}</h1>
          <p className="muted">Un resumen de los problemas de tu organización.</p>
        </div>
        <span className="date-chip">{new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(new Date())}</span>
      </div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <section className="stat-grid" aria-label="Resumen de problemas">
        <StatCard label="Problemas abiertos" value={summary ? (summary.por_estado?.NUEVO || 0) + (summary.por_estado?.EN_ANALISIS || 0) + (summary.por_estado?.ERROR_CONOCIDO || 0) : "—"} note="Requieren seguimiento" tone="blue" />
        <StatCard label="En análisis" value={summary?.por_estado?.EN_ANALISIS ?? "—"} note="Investigación activa" tone="violet" />
        <StatCard label="Errores conocidos" value={summary?.por_estado?.ERROR_CONOCIDO ?? "—"} note="Con workaround registrado" tone="amber" />
        <StatCard label="Total registrados" value={summary?.total ?? "—"} note="En este tenant" tone="green" />
        <StatCard label="Incidentes por estado" value="—" note="Pendiente de integrar el módulo" tone="blue" />
        <StatCard label="Cambios pendientes" value="—" note="Pendiente de integrar el módulo" tone="amber" />
      </section>
      <section className="panel">
        <div className="section-heading">
          <div><p className="eyebrow">SEGUIMIENTO</p><h2>Problemas recientes</h2></div>
          <Link className="text-link" to="/problemas">Ver todos <span aria-hidden="true">→</span></Link>
        </div>
        <ProblemRows items={recent} />
      </section>
    </div>
  );
}

function StatCard({ label, value, note, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`} aria-hidden="true">{label.charAt(0)}</div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className="stat-note">{note}</p>
    </article>
  );
}

export function ProblemRows({ items }) {
  if (!items.length) return <p className="empty-state">Todavía no hay problemas para mostrar.</p>;
  return (
    <div className="problem-list">
      {items.map((item) => (
        <Link className="problem-row" to={`/problemas/${encodeURIComponent(item.problema_id)}`} key={item.problema_id}>
          <span className="priority-dot" data-priority={item.prioridad} aria-label={`Prioridad ${item.prioridad}`} />
          <span className="problem-row-main">
            <strong>{item.titulo}</strong>
            <small>{item.problema_id} · {item.incidentes_ids?.length || 0} incidentes vinculados</small>
          </span>
          <span className={`status-badge status-${item.estado}`}>{item.estado.replaceAll("_", " ")}</span>
          <span className="row-chevron" aria-hidden="true">›</span>
        </Link>
      ))}
    </div>
  );
}
