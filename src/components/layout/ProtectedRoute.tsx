import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = sessionStorage.getItem("mcc_auth_token");
  const isAuthenticated = sessionStorage.getItem("mcc_is_authenticated");

  if (!token && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
