import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

// useToken is a custom React hook that manages the JWT token in localStorage.
// A "hook" is just a function that uses React features (like useState) and starts with "use".
// This hook is used by AuthContext — it handles reading, saving, and removing the token.
export default function useToken() {

    // On first load, read the token from localStorage and store it in React state.
    // useState() keeps track of the current value and re-renders components when it changes.
    const [token, setToken] = useState(getToken());

    // Reads the token from localStorage and checks if it is still valid.
    // Returns the token string if valid, or null if missing/expired/broken.
    function getToken() {
        const storedToken = localStorage.getItem('token');

        // No token saved at all — user has never logged in (or already logged out)
        if (!storedToken) {
            return null;
        }

        try {
            // jwtDecode reads the payload inside the token without verifying the signature.
            // We use it only to check the expiry time (decoded.exp).
            const decoded = jwtDecode(storedToken);
            // Date.now() returns milliseconds; JWT exp is in seconds — so we divide by 1000
            const currentTimeInSeconds = Date.now() / 1000;

            // If the token has no expiry field, or it has already expired — treat it as invalid
            if (!decoded.exp || decoded.exp < currentTimeInSeconds) {
                localStorage.removeItem('token');
                return null;
            }

            // Token exists and is not expired — return it
            return storedToken;

        } catch (error) {
            // jwtDecode threw an error — the token string is malformed / corrupted
            localStorage.removeItem('token');
            return null;
        }
    }

    // Saves a new token to localStorage and updates React state.
    // Called after a successful login or registration.
    function saveToken(newToken: string) {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    }

    // Deletes the token from localStorage and clears React state.
    // Called when the user logs out.
    function removeToken() {
        localStorage.removeItem('token');
        setToken(null);
    }

    // Expose these three things to whatever uses this hook.
    // Note: we expose saveToken as "setToken" so the name stays consistent for callers.
    return {
        token,
        setToken: saveToken,
        removeToken,
    };
}
