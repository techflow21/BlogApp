import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';

interface Props {
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ requireAdmin = false }: Props) {
  const { token, user } = useAppSelector((s) => s.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user?.roles?.includes('Admin')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
