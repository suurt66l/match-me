interface Props {
    isMine: boolean,
    message: {
        senderId: number;
        recipientId: number;
        content: string;
        timestamp: string;
        read: boolean;
    }
}

function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatMessage({ isMine, message }: Props) {
    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-xl px-4 py-2 text-sm ${isMine ? "bg-amber-950 text-amber-300" : "bg-amber-500 text-amber-950"}`}>
                {message.content}
                <div className={`flex items-center justify-end gap-1 mt-1 text-xs select-none ${isMine ? "text-amber-600" : "text-amber-800"}`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {isMine && (
                        <span className={message.read ? "text-amber-400" : "text-amber-700"}>
                            {message.read ? "✓✓" : "✓"}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}