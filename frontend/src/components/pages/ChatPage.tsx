import { useState, useEffect, useRef, useCallback } from "react";
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
  const [lastActive, setLastActive] = useState<Record<number, string>>({});
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [myId, setMyId] = useState<number | null>(null);
  // Pagination state for chat history
  const [historyPage, setHistoryPage] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("with") ? Number(searchParams.get("with")) : null;
  const activeUser = connections.find(c => c.id === activeId) ?? null;

  const { token } = useAuth();
  const { client } = useWebSocket();
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // When true, the next messages state update is a history load — skip auto-scroll to bottom
  const skipScrollRef = useRef(false);

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

  // useCallback keeps the function reference stable across renders.
  // Without it, every render would create a new function object, which would cause
  // the useEffect below to re-run on every render — triggering infinite API calls.
  const loadConnections = useCallback(async () => {
    if (!token) return;

    // Fetches a single user's display info (name, avatar) by their ID
    async function fetchConnectionDetails(id: number): Promise<Connection | null> {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${id}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return {
          connectionId: 0,
          id: data.id,
          nickname: data.nickname,
          avatarUrl: data.profilePictureUrl || null,
          isOnline: false, // online state is managed separately via onlineIds
        };
      } catch {
        return null;
      }
    }

    try {
      // Fire all four requests simultaneously instead of one after another —
      // Promise.all waits for all of them to finish before continuing
      const [connRes, unreadRes, onlineRes, lastActiveRes] = await Promise.all([
        fetch("http://localhost:8080/api/connections", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/chat/unread", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/chat/online", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/chat/last-active", { headers: { "Authorization": `Bearer ${token}` } }),
      ]);

      // GET /api/connections returns just a list of user IDs — we then fetch each one's details
      const activeIds: number[] = connRes.ok ? await connRes.json() : [];
      const activeUsers = await Promise.all(activeIds.map(id => fetchConnectionDetails(id)));

      // Filter out any nulls (users whose profiles couldn't be loaded)
      setConnections(activeUsers.filter((u): u is Connection => u !== null));

      // Unread counts: { userId -> number } — drives the red badge on each sidebar entry
      if (unreadRes.ok) setUnreadCounts(await unreadRes.json());
      // Online IDs come from REST on load; real-time updates arrive via WebSocket subscription
      if (onlineRes.ok) setOnlineIds(new Set(await onlineRes.json()));
      // Last active timestamps: { userId -> ISO string } — used to sort sidebar by most recent
      if (lastActiveRes.ok) setLastActive(await lastActiveRes.json());
    } catch { /* unreachable */ }
  }, [token]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  // Re-seed online status each time the WebSocket connects.
  // The initial loadConnections REST call can race with other users connecting,
  // so we re-fetch once the socket is confirmed up to get an accurate snapshot.
  useEffect(() => {
    if (!client || !token) return;
    fetch("http://localhost:8080/api/chat/online", {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then((ids: number[]) => setOnlineIds(new Set(ids)));
  }, [client, token]);

  // Set up all WebSocket subscriptions. Re-runs when the client connects or the active chat changes.
  useEffect(() => {
    if (!client) return;

    // Connection list updates (new request received, request accepted)
    const subConnections = client.subscribe("/user/queue/connections", () => loadConnections());

    // Incoming messages delivered by the backend to this user's private queue
    const subMessages = client.subscribe("/user/queue/messages", (frame) => {
      const msg: Message = JSON.parse(frame.body);
      setMessages(prev => [...prev, msg]);
      // Update last active time so sidebar re-sorts to put this conversation first
      setLastActive(prev => ({ ...prev, [msg.senderId]: msg.timestamp }));
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

    // /user/queue/status — backend pushes status changes only for this user's accepted connections
    const subStatus = client.subscribe("/user/queue/status", (frame) => {
      const data = JSON.parse(frame.body);
      // Update the Set without touching the connections array — avoids overwriting online state on re-render
      setOnlineIds(prev => {
        const next = new Set(prev);
        if (data.online) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    });

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
      subConnections.unsubscribe();
      subMessages.unsubscribe();
      subTyping.unsubscribe();
      subStatus.unsubscribe();
      subReceipts.unsubscribe();
    };
  }, [client, activeId, loadConnections]);

  // Runs whenever the user selects a different conversation.
  // Loads the last 50 messages and marks all unread messages from that user as read.
  useEffect(() => {
    // No conversation selected — clear the message list and stop showing typing indicator
    if (!activeId) { setMessages([]); setIsTyping(false); setHasMoreHistory(false); setHistoryPage(0); return; }
    async function loadHistory() {
      try {
        // page=0&size=50 means "give me the first page of 50 messages" (newest 50)
        const res = await fetch(`http://localhost:8080/api/chat/history/${activeId}?page=0&size=50`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // The API returns messages newest-first (for efficient pagination).
          // We reverse them so the oldest message appears at the top of the chat window.
          setMessages([...data.content].reverse());
          // `last` is false when there are more pages of older messages to load
          setHasMoreHistory(!data.last);
          setHistoryPage(0);
        }
        if (client) {
          // Tell the server these messages have been read — triggers a read receipt
          // on the other user's screen (their sent messages get a ✓✓ checkmark)
          client.publish({
            destination: "/app/chat.read",
            body: JSON.stringify({ senderId: activeId }),
          });
        }
        // Clear the unread badge for this conversation in the sidebar
        setUnreadCounts(prev => ({ ...prev, [activeId as number]: 0 }));
      } catch { /* unreachable */ }
    }
    loadHistory();
    setIsTyping(false);
  }, [activeId, token]);

  // Loads the next page of older messages and prepends them to the top of the list.
  // The scroll position is preserved so the user stays at the same place.
  async function loadMoreHistory() {
    if (!activeId || !token) return;
    const nextPage = historyPage + 1;
    try {
      const res = await fetch(`http://localhost:8080/api/chat/history/${activeId}?page=${nextPage}&size=50`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Prepend older messages to the top — reverse because API returns newest-first
        skipScrollRef.current = true;
        setMessages(prev => [...[...data.content].reverse(), ...prev]);
        setHasMoreHistory(!data.last);
        setHistoryPage(nextPage);
      }
    } catch { /* unreachable */ }
  }

  // Scroll to the bottom when a new message arrives, but not when loading older history
  useEffect(() => {
    if (skipScrollRef.current) { skipScrollRef.current = false; return; }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Called on every keystroke in the input field.
  // Sends a "typing: true" event to the other user and automatically stops it after 2 seconds
  // of inactivity — so the typing indicator disappears if the user stops typing.
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    if (!client || !activeId) return;
    client.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ recipientId: activeId, typing: true }),
    });
    // Reset the 2-second timer each time the user types a character
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

    // Publish the message to the backend via WebSocket — the backend saves it and forwards
    // it to the recipient's private queue (/user/queue/messages)
    client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ recipientId: activeId, content: text }),
    });

    // Stop the typing indicator immediately when a message is sent
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    client.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ recipientId: activeId, typing: false }),
    });

    // Optimistically add the message to the local state so it appears instantly,
    // without waiting for the server to echo it back
    const now = new Date().toISOString();
    setMessages(prev => [...prev, {
      senderId: myId,
      recipientId: activeId,
      content: text,
      timestamp: now,
      read: false,
    }]);
    setLastActive(prev => ({ ...prev, [activeId]: now }));
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <div className="flex h-full overflow-hidden bg-amber-300">
      <ChatSidebar
        connections={connections
          .map(c => ({ ...c, isOnline: onlineIds.has(c.id) }))
          .sort((a, b) => {
            const ta = lastActive[a.id] ?? "";
            const tb = lastActive[b.id] ?? "";
            return tb.localeCompare(ta); // most recent first
          })}
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
        hasMoreHistory={hasMoreHistory}
        onLoadMore={loadMoreHistory}
        onInputChange={handleInputChange}
        onSend={sendMessage}
        onKeyDown={handleKeyDown}
        onBack={() => setSearchParams({})}
        bottomRef={bottomRef}
      />
    </div>
  );
}