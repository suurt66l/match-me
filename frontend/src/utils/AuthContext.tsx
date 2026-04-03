import React, { createContext, useContext } from 'react';
import useToken from './useToken';
import { API_URL } from './api';

interface AuthContextProps {
    token: string | null;
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
export default function AuthProvider( { children } : { children: React.ReactNode }) {
  const { token, setToken, removeToken } = useToken();

  /* Handles login */
  async function login( loginCredentials : LoginCredentials) : Promise<AuthResponse> {
  
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginCredentials)
    });
    
    let data = await response.json();

    if(!response.ok){
      return {
        status: response.status,
        message: data.message
      }
    }

    setToken(data.token);
    return {
        status: response.status,
        token: data.token,
        //message: data.message,
    }
  };

  /* Handles registration */
  async function register( regCredentials : RegCredentials) : Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regCredentials)
    });

    let data = await response.json();

    if(!response.ok){
      return {
        status: response.status,
        message: data.message
      }
    }

    setToken(data.token);
    return {
        status: response.status,
        token: data.token,
        //message: data.message,
    }

  }

  /* Handles log out */
  function logout () {
    removeToken();
    //setUser(null);
  };

  const value = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
    register
  };
  
  //Returns context to the User
  return (
    <AuthContext value={value}>
      {children}
    </AuthContext>
  );
}

/* Just return context of the app */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}