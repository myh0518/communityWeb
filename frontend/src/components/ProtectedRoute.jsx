import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center py-20">로딩중...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}