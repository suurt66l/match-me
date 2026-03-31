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
}

export default function ChatPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
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
      } catch { /* unreachable */ }
    }
    loadConnections();
  }, [token]);

  useEffect(() => {
    if (!client) return;

    const subMessages = client.subscribe("/user/queue/messages", (frame) => {
      const msg: Message = JSON.parse(frame.body);
      setMessages(prev => [...prev, msg]);
    });

    const subTyping = client.subscribe("/user/queue/typing", (frame) => {
      const data = JSON.parse(frame.body);
      if (data.senderId === activeId) setIsTyping(data.typing);
    });

    const subStatus = client.subscribe("/topic/status", (frame) => {
      const data = JSON.parse(frame.body);
      setConnections(prev =>
        prev.map(c => c.id === data.userId ? { ...c, isOnline: data.online } : c)
      );
    });

    return () => {
      subMessages.unsubscribe();
      subTyping.unsubscribe();
      subStatus.unsubscribe();
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
    }]);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <div className="flex h-screen bg-amber-300">
      <ChatSidebar
        connections={connections}
        activeId={activeId}
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