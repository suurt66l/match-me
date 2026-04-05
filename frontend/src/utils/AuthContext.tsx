import React, { createContext, useContext } from 'react';
import useToken from './useToken';
import { API_URL } from './api';

// --- Type definitions ---
// These describe the shape of data that this context provides and expects.

// Everything that AuthContext makes available to the rest of the app
interface AuthContextProps {
    token: string | null;         // the JWT token string, or null if not logged in
    isAuthenticated: boolean;     // true if a valid token exists
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    logout: () => void;
    register: (credentials: RegCredentials) => Promise<AuthResponse>;
}

// Data needed to log in
interface LoginCredentials {
    email: string;
    password: string;
}

// Data needed to register
interface RegCredentials {
    nickname: string;
    email: string;
    password: string;
}

// What the backend sends back after login or register
interface AuthResponse {
    token?: string;    // the JWT token (present on success)
    message?: string;  // error message (present on failure)
    status: number;    // HTTP status code (200 = ok, 400/401 = error, etc.)
}

// createContext creates a "global store" that any component can read from.
// We start it as null — it will be filled in by AuthProvider below.
const AuthContext = createContext<AuthContextProps | null>(null);

// AuthProvider is a wrapper component placed at the top of the app (in App.tsx).
// It holds the auth state and provides login/logout/register functions to every
// component inside it, without needing to pass props down manually.
export default function AuthProvider({ children }: { children: React.ReactNode }) {

    // useToken handles reading/writing the JWT to localStorage
    const { token, setToken, removeToken } = useToken();

    // Sends login credentials to the backend.
    // On success, saves the returned token so the user stays logged in.
    // Returns the response so the login form can show error messages.
    async function login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        // Something went wrong (wrong password, user not found, etc.)
        if (!response.ok) {
            return { status: response.status, message: data.message };
        }

        // Success — save the token so the user is now "logged in"
        setToken(data.token);
        return { status: response.status, token: data.token };
    }

    // Sends registration data to the backend.
    // On success, the backend logs the user in immediately (returns a token).
    async function register(credentials: RegCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        // Registration failed (email already taken, validation error, etc.)
        if (!response.ok) {
            return { status: response.status, message: data.message };
        }

        // Success — save the token so the user is logged in right after registering
        setToken(data.token);
        return { status: response.status, token: data.token };
    }

    // Logs the user out by deleting their token.
    // After this, isAuthenticated becomes false and ProtectedRoute redirects to /login.
    function logout() {
        removeToken();
    }

    // This object is what gets shared with the rest of the app via context.
    // !! converts a value to boolean: !!null = false, !!"someToken" = true
    const contextValue = {
        token,
        isAuthenticated: !!token,
        login,
        logout,
        register,
    };

    return (
        <AuthContext value={contextValue}>
            {children}
        </AuthContext>
    );
}

// useAuth is a convenience hook — instead of writing useContext(AuthContext)
// everywhere, components just call useAuth() to get login/logout/token.
export function useAuth() {
    const context = useContext(AuthContext);

    // This error fires if useAuth() is called outside of AuthProvider.
    // In practice this never happens since AuthProvider wraps the whole app.
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
