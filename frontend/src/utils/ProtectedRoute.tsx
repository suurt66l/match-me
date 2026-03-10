import { Navigate } from 'react-router-dom';

interface Props {
    children: React.ReactNode;
    token: string | null;
}

export default function ProtectedRoute({ children, token } : Props) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}