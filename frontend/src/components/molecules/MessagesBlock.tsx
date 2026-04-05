import ChatMessage from "../atoms/ChatMessage";

interface Message {
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Props {
    messages: Message[];
    myId: number | null;
    hasMoreHistory: boolean;
    onLoadMore: () => void;
    bottomRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessagesBlock({messages, myId, hasMoreHistory, onLoadMore, bottomRef}: Props){
    return(
        <>
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2">
          {/* Load older messages button — only shown when more pages exist */}
          {hasMoreHistory && (
            <div className="flex justify-center pb-2">
              <button
                onClick={onLoadMore}
                className="text-sm text-amber-800 bg-amber-400 hover:bg-amber-500 px-4 py-1.5 rounded-full"
              >
                Load older messages
              </button>
            </div>
          )}
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