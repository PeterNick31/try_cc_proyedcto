import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { login as loginRequest } from "../services/auth.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "itsm-auth";
const demoMode =
  import.meta.env.VITE_DEMO_MODE === "true" ||
  (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE !== "false");

function readStoredUser() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!demoMode && stored?.token === "demo-token") {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return stored;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const signIn = useCallback(async ({ tenantId, email, password }) => {
    let session;
    if (demoMode) {
      if (!tenantId || !email || !password) {
        throw new Error("Completa tenant, correo y contraseña.");
      }
      session = {
        token: "demo-token",
        user: { tenant_id: tenantId, email, nombre: "Administradora de demostración", rol: "ADMIN" },
      };
    } else {
      session = await loginRequest({ tenant_id: tenantId, email, password });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session.user);
    return session;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signOut, demoMode }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return value;
}
