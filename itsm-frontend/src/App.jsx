import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AppShell from "./shared/AppShell.jsx";
import LoginPage from "./modules/auth/LoginPage.jsx";
import DashboardPage from "./modules/dashboard/DashboardPage.jsx";
import ProblemsPage from "./modules/problems/ProblemsPage.jsx";
import ProblemDetailPage from "./modules/problems/ProblemDetailPage.jsx";

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="problemas" element={<ProblemsPage />} />
        <Route path="problemas/:id" element={<ProblemDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
