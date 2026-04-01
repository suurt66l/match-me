import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { useWebSocket } from "../../utils/WebSocketContext";
import ChatSidebar from "../organisms/ChatSidebar";
import ChatWindow from "../organisms/ChatWindow";

interface Connection {
  connectionId: number;
  id: number;
  nickname: string;
  avatarUrl: string | null;
  isOnline: boolean;
}

interface Message {
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
  read: boolean;
}

export default function ChatPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [onlineIds, setOnlineIds] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [myId, setMyId] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("with") ? Number(searchParams.get("with")) : null;
  const activeUser = connections.find(c => c.id === activeId) ?? null;

  const { token } = useAuth();
  const { client } = useWebSocket();
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("http://localhost:8080/api/me", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMyId(data.id);
        }
      } catch { /* unreachable */ }
    }
    if (token) loadMe();
  }, [token]);

  useEffect(() => {
    async function loadConnections() {
      try {
        const res = await fetch("http://localhost:8080/api/connections", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setConnections(data.map((c: Connection) => ({ ...c, isOnline: false })));
        }
        const unreadRes = await fetch("http://localhost:8080/api/chat/unread", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (unreadRes.ok) {
          const data = await unreadRes.json();
          setUnreadCounts(data);
        }
        // Seed the initial online state from REST so we don't depend on WebSocket timing.
        // Real-time updates after this come from the /topic/status subscription.
        const onlineRes = await fetch("http://localhost:8080/api/chat/online", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (onlineRes.ok) {
          const data: number[] = await onlineRes.json();
          setOnlineIds(new Set(data));
        }
      } catch { /* unreachable */ }
    }
    loadConnections();
  }, [token]);

  // Set up all WebSocket subscriptions. Re-runs when the client connects or the active chat changes.
  useEffect(() => {
    if (!client) return;

    // Incoming messages delivered by the backend to this user's private queue
    const subMessages = client.subscribe("/user/queue/messages", (frame) => {
      const msg: Message = JSON.parse(frame.body);
      setMessages(prev => [...prev, msg]);
      if (msg.senderId !== activeId) {
        // Message is from someone other than the open chat — increment their unread badge
        setUnreadCounts(prev => ({ ...prev, [msg.senderId]: (prev[msg.senderId] ?? 0) + 1 }));
      } else {
        // Chat is open — mark as read immediately via WebSocket so sender gets ✓✓ in real time
        client.publish({
          destination: "/app/chat.read",
          body: JSON.stringify({ senderId: activeId }),
        });
      }
    });

    // Typing indicator sent by the other user — only show it if it's from the active chat
    const subTyping = client.subscribe("/user/queue/typing", (frame) => {
      const data = JSON.parse(frame.body);
      if (data.senderId === activeId) setIsTyping(data.typing);
    });

    // Shared handler for both status channels below
    function handleStatusUpdate(frame: { body: string }) {
      const data = JSON.parse(frame.body);
      // Update the Set without touching the connections array — avoids overwriting online state on re-render
      setOnlineIds(prev => {
        const next = new Set(prev);
        if (data.online) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    }

    // /topic/status — broadcasts to everyone when any user goes online/offline
    const subStatus = client.subscribe("/topic/status", handleStatusUpdate);
    // /user/queue/status — backend replies here with the initial status of this user's connections
    const subMyStatus = client.subscribe("/user/queue/status", handleStatusUpdate);
    // Request initial statuses after subscribing (backend can't push before we're subscribed)
    client.publish({ destination: "/app/status.request", body: "{}" });

    // Read receipts — backend sends this when the recipient reads our messages (triggers ✓✓)
    const subReceipts = client.subscribe("/user/queue/read-receipts", (frame) => {
      const receipt = JSON.parse(frame.body);
      // Mark all messages sent to that user as read
      setMessages(prev =>
        prev.map(m => m.recipientId === receipt.readBy ? { ...m, read: true } : m)
      );
    });

    // Clean up all subscriptions when the component unmounts or dependencies change
    return () => {
      subMessages.unsubscribe();
      subTyping.unsubscribe();
      subStatus.unsubscribe();
      subMyStatus.unsubscribe();
      subReceipts.unsubscribe();
    };
  }, [client, activeId]);

  useEffect(() => {
    if (!activeId) { setMessages([]); setIsTyping(false); return; }
    async function loadHistory() {
      try {
        const res = await fetch(`http://localhost:8080/api/chat/history/${activeId}?page=0&size=50`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages([...data.content].reverse());
        }
        if (client) {
          client.publish({
            destination: "/app/chat.read",
            body: JSON.stringify({ senderId: activeId }),
          });
        }
        setUnreadCounts(prev => ({ ...prev, [activeId as number]: 0 }));
      } catch { /* unreachable */ }
    }
    loadHistory();
    setIsTyping(false);
  }, [activeId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    if (!client || !activeId) return;
    client.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ recipientId: activeId, typing: true }),
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      client.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify({ recipientId: activeId, typing: false }),
      });
    }, 2000);
  }

  function sendMessage() {
    const text = input.trim();
    if (!text || !activeId || !client || myId === null) return;
    client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ recipientId: activeId, content: text }),
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    client.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ recipientId: activeId, typing: false }),
    });
    setMessages(prev => [...prev, {
      senderId: myId,
      recipientId: activeId,
      content: text,
      timestamp: new Date().toISOString(),
      read: false,
    }]);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <div className="flex h-screen bg-amber-300">
      <ChatSidebar
        connections={connections.map(c => ({ ...c, isOnline: onlineIds.has(c.id) }))}
        activeId={activeId}
        unreadCounts={unreadCounts}
        onSelect={(id) => setSearchParams({ with: String(id) })}
      />
      <ChatWindow
        activeId={activeId}
        activeUser={activeUser}
        messages={messages}
        myId={myId}
        isTyping={isTyping}
        input={input}
        onInputChange={handleInputChange}
        onSend={sendMessage}
        onKeyDown={handleKeyDown}
        onBack={() => setSearchParams({})}
        bottomRef={bottomRef}
      />
    </div>
  );
}