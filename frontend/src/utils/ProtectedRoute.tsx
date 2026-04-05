import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

// ProtectedRoute is a wrapper used in App.tsx around pages that require login.
// If the user is NOT logged in, they are redirected to /login automatically.
// If the user IS logged in, <Outlet /> renders whatever child route was matched
// (e.g. MatcherPage, ChatPage, etc.)
export default function ProtectedRoute() {
    const { isAuthenticated } = useAuth();

    // Not logged in — send them to the login page
    // "replace" means the login page replaces the current history entry,
    // so pressing the back button won't loop back to a protected page
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Logged in — render the actual page that was requested
    return <Outlet />;
}
