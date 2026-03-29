import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { useWebSocket } from "../../utils/WebSocketContext";
import ChatSidebar from "../organisms/ChatSidebar";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("with") ? Number(searchParams.get("with")) : null;
  const activeUser = connections.find(c => c.id === activeId) ?? null;

  const { token } = useAuth();
  const { client } = useWebSocket();
  const [myId, setMyId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get current user id
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

  // Load connections list
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

  // Subscribe to messages, typing, and online status via STOMP
  useEffect(() => {
    if (!client) return;

    const subMessages = client.subscribe("/user/queue/messages", (frame) => {
      const msg: Message = JSON.parse(frame.body);
      setMessages(prev => [...prev, msg]);
    });

    const subTyping = client.subscribe("/user/queue/typing", (frame) => {
      const data = JSON.parse(frame.body);
      if (data.senderId === activeId) {
        setIsTyping(data.typing);
      }
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

  // Load history when switching conversation
  useEffect(() => {
    if (!activeId) { setMessages([]); setIsTyping(false); return; }
    async function loadHistory() {
      try {
        const res = await fetch(`http://localhost:8080/api/chat/history/${activeId}?page=0&size=50`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Page comes back newest-first, reverse to show oldest on top
          setMessages([...data.content].reverse());
        }
      } catch { /* unreachable */ }
    }
    loadHistory();
    setIsTyping(false);
  }, [activeId, token]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    if (!client || !activeId) return;

    // Send typing = true
    client.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ recipientId: activeId, typing: true }),
    });

    // Reset debounce timer — send typing = false after 2s of no input
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

    // Stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    client.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ recipientId: activeId, typing: false }),
    });

    // Add optimistically to UI
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
        onSelect={(id: number) => setSearchParams({ with: String(id) })} />

      {/* Chat panel */}
      <div className={`flex-col flex-1 min-w-0 ${activeId ? "flex" : "hidden sm:flex"}`}>
        {activeUser ? (
          <>
            {/* Header */}
            <div className="bg-amber-500 px-4 py-3 shrink-0 flex items-center gap-3">
              <button
                onClick={() => setSearchParams({})}
                className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full text-amber-300 bg-amber-950 hover:bg-amber-800 transition-colors"
                aria-label="Back"
              >
                &#8592;
              </button>
              <div>
                <p className="text-amber-950 font-bold">{activeUser.nickname}</p>
                {isTyping && <p className="text-amber-800 text-xs">typing...</p>}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2">
              {messages.length === 0 && (
                <p className="text-amber-700 text-sm">No messages yet. Say hi!</p>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.senderId === myId;
                return (
                  <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs rounded-xl px-4 py-2 text-sm ${isMine ? "bg-amber-950 text-amber-300" : "bg-amber-500 text-amber-950"}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="bg-amber-400 px-4 py-3 shrink-0 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 rounded-lg bg-white/20 px-4 py-2 text-sm text-amber-950 placeholder-amber-700 outline-none focus:bg-white/30"
              />
              <button
                onClick={sendMessage}
                className="rounded-lg bg-amber-950 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-900"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-amber-700">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

    </div>
  );
}
