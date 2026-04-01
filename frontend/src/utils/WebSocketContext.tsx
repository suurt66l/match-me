import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";

interface StompContextValue {
  client: Client | null;
}

const WebSocketContext = createContext<StompContextValue>({ client: null });

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        setClient(stompClient);
      },
      onDisconnect: () => {
        setClient(null);
      },
    });

    stompClient.activate();

    return () => {
      if (stompClient.connected) {
        stompClient.publish({ destination: "/app/chat.offline", body: "{}" });
      }
      stompClient.deactivate();
      setClient(null);
    };
  }, [token, isAuthenticated]);

  return (
    <WebSocketContext.Provider value={{ client }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
