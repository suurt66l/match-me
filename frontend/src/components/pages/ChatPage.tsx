import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../utils/AuthContext";
import { useWebSocket } from "../../utils/WebSocketContext";

interface Connection {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  isOnline: boolean;
}

interface Message {
  from: string;
  text: string;
  timestamp: string;
  senderId: number;
  recipientId: number;
}

export default function ChatPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("with") ? Number(searchParams.get("with")) : null;
  const activeUser = connections.find(c => c.id === activeId) ?? null;

  const { token } = useAuth();
  const { ws } = useWebSocket();
  const myEmail = token ? (jwtDecode(token) as { email: string }).email : "";
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load connections list
  useEffect(() => {
    async function loadConnections() {
      try {
        const res = await fetch("http://localhost:8080/api/connections", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok) setConnections(await res.json());
      } catch { /* unreachable */ }
    }
    loadConnections();
  }, [token]);

  // Subscribe to incoming messages — re-runs when ws or activeId changes
  // so activeId is always fresh inside the handler (no stale closure)
  useEffect(() => {
    if (!ws) return;

    function handleMessage(event: MessageEvent) {
      const msg = JSON.parse(event.data);
      if (msg.type === "message") {
        if (msg.senderId === activeId || msg.recipientId === activeId) {
          setMessages(prev => [...prev, msg]);
        }
      } else if (msg.type === "status") {
        setConnections(prev =>
          prev.map(c => c.id === msg.userId ? { ...c, isOnline: msg.isOnline } : c)
        );
      } else if (msg.type === "dismissed") {
        setConnections(prev => prev.filter(c => c.id !== msg.userId));
        setMessages([]);
        setSearchParams({});
      }
    }

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [ws, activeId]);

  // Load history when active conversation changes
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    async function loadHistory() {
      try {
        const res = await fetch(`http://localhost:8080/api/messages/${activeId}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok) setMessages(await res.json());
      } catch { /* unreachable */ }
    }
    loadHistory();
  }, [activeId, token]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text || !activeId || !ws) return;
    ws.send(JSON.stringify({ type: "message", to: activeId, text }));
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <div className="flex h-screen bg-amber-300">

      {/* Sidebar — full screen on mobile when no chat open, fixed width on desktop */}
      <div className={`bg-amber-400 flex-col w-full sm:w-64 sm:shrink-0 ${activeId ? "hidden sm:flex" : "flex"}`}>
        <p className="text-amber-950 font-bold px-4 py-4 text-lg">Messages</p>
        <div className="flex flex-col gap-1 px-2 overflow-y-auto">
          {connections.map(user => (
            <button
              key={user.id}
              onClick={() => setSearchParams({ with: String(user.id) })}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left ${activeId === user.id ? "bg-amber-950 text-amber-300" : "text-amber-950 hover:bg-amber-500"}`}
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-amber-950 overflow-hidden">
                  <img
                    src={user.avatarUrl ?? "/assets/default-avatar.svg"}
                    alt={user.nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-amber-400 ${user.isOnline ? "bg-green-400" : "bg-gray-600"}`} />
              </div>
              <span className="text-sm font-semibold truncate">{user.nickname}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel — hidden on mobile when no chat selected */}
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
              <p className="text-amber-950 font-bold">{activeUser.nickname}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2">
              {messages.length === 0 && (
                <p className="text-amber-700 text-sm">No messages yet. Say hi!</p>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.from === myEmail;
                return (
                  <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs rounded-xl px-4 py-2 text-sm ${isMine ? "bg-amber-950 text-amber-300" : "bg-amber-500 text-amber-950"}`}>
                      {msg.text}
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
                onChange={e => setInput(e.target.value)}
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
