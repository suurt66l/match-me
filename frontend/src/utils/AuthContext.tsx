import React, { createContext, useContext, useState } from 'react';
import useToken from './useToken';

interface AuthContextProps {
    token: string | null;
    user: null;
    login: (credentials: Credentials) => Promise<LoginResponse>;
    logout: () => void;
    isAuthenticated: boolean;
}

interface Props {
    children: React.ReactNode;
}

interface Credentials {
  email: string;
  password: string;
}

interface LoginResponse {
    token? : string;
    message? : string;
    status: number;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children } : Props) {
  const { token, setToken, removeToken } = useToken();
  const [user, setUser] = useState(null);

  async function login( credentials : Credentials) : Promise<LoginResponse> {

    console.log("Credentials: " + credentials.email + " " + credentials.password)

    const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    
    const data = await response.json();

    setToken(data.token);
    return {
        token: data.token,
        message: data.message,
        status: response.status
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}