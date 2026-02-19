import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import Navbar from "./components/Navbar.tsx";
import Landing from "./pages/Landing.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Cars from "./pages/Cars.tsx";
import CarDetails from "./pages/CarDetails.tsx";
import Booking from "./pages/Booking.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import ChatWidget from "./components/ChatWidget.tsx";
function AdminCarDetailsRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/cars/${id}?from=admin` : "/cars"} replace />;
}

function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:id" element={<CarDetails />} />
            <Route
              path="/booking/:id"
              element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cars/:id"
              element={
                <ProtectedRoute adminOnly>
                  <AdminCarDetailsRedirect />
                </ProtectedRoute>
              }
            />
            {/* Optionnel: page 404 */}
            <Route path="*" element={<div>404 - Page non trouvée</div>} />
          </Routes>
          <ChatWidget />
          <Toaster position="top-center" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
