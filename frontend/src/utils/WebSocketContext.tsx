import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface WsContextValue {
  ws: WebSocket | null;
}

const WebSocketContext = createContext<WsContextValue>({ ws: null });

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "auth", token }));
      setWs(socket);
    };

    socket.onclose = () => setWs(null);

    return () => {
      socket.close();
      setWs(null);
    };
  }, [token, isAuthenticated]);

  return (
    <WebSocketContext.Provider value={{ ws }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
