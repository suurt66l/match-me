import ChatMessage from "../atoms/ChatMessage";

interface Message {
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
}

interface Props {
    messages: Message[];
    myId: number | null;
    bottomRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessagesBlock({messages, myId, bottomRef}: Props){
    return(
        <>
          {/* If there is no messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2">
            {messages.length === 0 && (
              <p className="text-amber-700 text-sm">No messages yet. Say hi!</p>
            )}

            {messages.map((msg, i) => {
              const isMine = msg.senderId === myId;
              return (
                <div key={i}>
                  <ChatMessage 
                    isMine={isMine}
                    message={msg}/>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </>
    );
}