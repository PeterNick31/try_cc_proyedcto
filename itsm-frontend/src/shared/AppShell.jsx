import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { setUnauthorizedHandler } from "../services/api.js";
import { useEffect } from "react";

export default function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
      navigate("/login", { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate, signOut]);

  function logout() {
    signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark brand-small">N</span><span>northstar<span className="brand-sub">ITSM CLOUD</span></span></div>
        <p className="nav-caption">ESPACIO DE TRABAJO</p>
        <nav className="main-nav" aria-label="Navegación principal">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><span className="nav-icon">⌂</span>Dashboard</NavLink>
          <NavLink to="/problemas" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><span className="nav-icon">◈</span>Problemas</NavLink>
          <span className="nav-link nav-disabled" title="Se integrará cuando esté listo el módulo del equipo"><span className="nav-icon">◉</span>Incidentes <small>Pronto</small></span>
          <span className="nav-link nav-disabled" title="Se integrará cuando esté listo el módulo del equipo"><span className="nav-icon">↗</span>Cambios <small>Pronto</small></span>
          <span className="nav-link nav-disabled" title="Se integrará cuando esté listo el módulo del equipo"><span className="nav-icon">▤</span>Solicitudes <small>Pronto</small></span>
        </nav>
        <div className="sidebar-bottom"><span className="online-dot" />Todos los sistemas operativos</div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="tenant-indicator"><span className="tenant-avatar">{user?.tenant_id?.charAt(0).toUpperCase()}</span><span><strong>{user?.tenant_id}</strong><small>Tenant activo</small></span><span className="tenant-caret">⌄</span></div>
          <div className="profile-menu"><div className="profile-avatar">{user?.nombre?.charAt(0) || "A"}</div><span className="profile-text"><strong>{user?.nombre || user?.email}</strong><small>{user?.rol}</small></span><button className="logout-button" onClick={logout}>Salir</button></div>
        </header>
        <main><Outlet /></main>
      </div>
    </div>
  );
}
