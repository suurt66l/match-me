import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";
import { API_URL } from "./api";

/**
 * WebSocketContext gives any component in the app access to the shared STOMP client.
 * STOMP is a messaging protocol that runs on top of WebSocket — it adds concepts like
 * destinations (channels) and subscriptions so different types of messages can be routed
 * independently over the same connection.
 *
 * The client is null when the user is not logged in or the connection hasn't been
 * established yet. Components should always check for null before using it.
 */

interface StompContextValue {
  client: Client | null;
}

const WebSocketContext = createContext<StompContextValue>({ client: null });

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();

  // client is exposed to the rest of the app — null means "not connected yet"
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    // Don't open a connection unless the user is logged in
    if (!isAuthenticated || !token) return;

    // SockJS is a fallback-friendly WebSocket wrapper — it tries a real WebSocket first,
    // then falls back to HTTP long-polling if the browser or network blocks WebSockets.
    // The JWT token is sent in the CONNECT frame headers so the backend can authenticate
    // the WebSocket session the same way it authenticates regular HTTP requests.
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        // Connection is ready — expose the client so other components can subscribe and publish
        setClient(stompClient);
      },
      onDisconnect: () => {
        // Connection closed — clear the client so components know not to use it
        setClient(null);
      },
    });

    stompClient.activate();

    // When the user closes the browser tab, the browser kills the page before the WebSocket
    // DISCONNECT frame can be sent. The server would then never know the user went offline.
    // sendBeacon is a special browser API that queues an HTTP request and guarantees it is
    // sent even after the page is destroyed — the OS hands it off to the network stack.
    // We include the JWT in the request body because sendBeacon cannot set custom headers.
    function handleUnload() {
      navigator.sendBeacon(
        `${API_URL}/api/chat/offline`,
        new Blob([JSON.stringify({ token })], { type: "application/json" })
      );
    }
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      // Remove the tab-close listener so it doesn't fire on normal navigation
      window.removeEventListener("beforeunload", handleUnload);

      // For clean disconnects (logout, navigating away) — tell the server we're offline
      // via the WebSocket itself, then shut it down gracefully
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

// Custom hook — components call useWebSocket() instead of useContext(WebSocketContext) directly
export function useWebSocket() {
  return useContext(WebSocketContext);
}
