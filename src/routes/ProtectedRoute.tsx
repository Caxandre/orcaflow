import { Navigate, Outlet } from 'react-router-dom';
import { Loading } from '../design-system/Loading';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen"><Loading label="Preparando seu espaço..." /></div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
