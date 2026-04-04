import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

// GuestRoute is the opposite of ProtectedRoute.
// It wraps pages that should only be visible when the user is NOT logged in (login, register).
// If the user is already logged in, they are redirected to the home page.
// This prevents a logged-in user from seeing the login form again.
export default function GuestRoute() {
    const { isAuthenticated } = useAuth();

    // Already logged in — send them to the main page
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Not logged in — render the actual guest page (login or register)
    return <Outlet />;
}
