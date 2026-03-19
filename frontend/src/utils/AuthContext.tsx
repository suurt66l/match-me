import React, { createContext, useContext, useState } from 'react';
import useToken from './useToken';

interface AuthContextProps {
    token: string | null;
    user: null;
    isAuthenticated: boolean;

    login: (loginCredentials: LoginCredentials) => Promise<AuthResponse>;
    logout: () => void;

    register: (regCredentials: RegCredentials) => Promise<AuthResponse>;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegCredentials {
  nickname: string;
  email: string;
  password: string;
}

interface AuthResponse {
    token? : string;
    message? : string;
    status: number;
}

const AuthContext = createContext<AuthContextProps | null>(null);

/* Handles authentication  */
export function AuthProvider( children : React.ReactNode) {
  const { token, setToken, removeToken } = useToken();
  const [user, setUser] = useState(null);

  async function login( loginCredentials : LoginCredentials) : Promise<AuthResponse> {
  
    const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginCredentials)
    });
    
    const text = await response.text();
    let data: any = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
    if(!response.ok){
      return {
        message: typeof data === "string" ? data : (data.message ?? "Something went wrong"),
        status: response.status
      }
    }

    setToken(data.token);
    return {
        token: data.token,
        message: data.message,
        status: response.status
    }
  };

  async function register( regCredentials : RegCredentials) : Promise<AuthResponse> {
    const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regCredentials)
    });

    const text = await response.text();
    let data: any = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
    if(!response.ok){
      return {
        message: typeof data === "string" ? data : (data.message ?? "Something went wrong"),
        status: response.status
      }
    }

    setToken(data.token);
    return {
        token: data.token,
        message: data.message,
        status: response.status
    }

  }

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
    register
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