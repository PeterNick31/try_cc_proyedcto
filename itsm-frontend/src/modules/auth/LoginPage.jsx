import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LoginPage() {
  const { signIn, demoMode } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ tenantId: "acme", email: "admin@acme.test", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(form);
      navigate("/", { replace: true });
    } catch (reason) {
      setError(reason.message || "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">N</div>
        <p className="eyebrow">IT SERVICE MANAGEMENT</p>
        <h1>Bienvenida</h1>
        <p className="muted">Ingresa a tu espacio de soporte.</p>
        {demoMode && <div className="demo-banner">Modo demostración: escribe cualquier contraseña.</div>}
        <form className="form-stack" onSubmit={submit}>
          <label>
            Tenant
            <select value={form.tenantId} onChange={(event) => setForm({ ...form, tenantId: event.target.value })}>
              <option value="acme">Acme Corp</option>
              <option value="globex">Globex</option>
              <option value="initech">Initech</option>
            </select>
          </label>
          <label>
            Correo
            <input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label>
            Contraseña
            <input type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary button-wide" disabled={busy}>
            {busy ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
        <p className="login-footnote">Acceso de demostración para el proyecto ITSM</p>
      </section>
    </main>
  );
}
