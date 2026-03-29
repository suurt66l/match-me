import ChatHeaderBlock from "../molecules/ChatHeaderBlock";
import MessageInputBlock from "../molecules/MessageInputBlock";

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

interface Props {
  activeId: number | null;
  activeUser: Connection | null;
  messages: Message[];
  myId: number | null;
  isTyping: boolean;
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBack: () => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatWindow({ activeId, activeUser, messages, myId, isTyping, input, onInputChange, onSend, onKeyDown, onBack, bottomRef }: Props) {
  return (
    <div className={`flex-col flex-1 min-w-0 ${activeId ? "flex" : "hidden sm:flex"}`}>
      {activeUser ? (
        <>
            <ChatHeaderBlock 
                isTyping={isTyping}
                activeUserName={activeUser.nickname}
                onBack={onBack}/>

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

            <MessageInputBlock 
                input={input}
                onInputChange={onInputChange}
                onKeyDown={onKeyDown}
                onSend={onSend}/>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-amber-700">Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
}