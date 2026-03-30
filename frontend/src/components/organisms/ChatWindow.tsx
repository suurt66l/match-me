import ChatHeaderBlock from "../molecules/ChatHeaderBlock";
import MessageInputBlock from "../molecules/MessageInputBlock";
import MessagesBlock from "../molecules/MessagesBlock";

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

            <MessagesBlock 
              messages={messages}
              myId={myId}
              bottomRef={bottomRef}/>

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