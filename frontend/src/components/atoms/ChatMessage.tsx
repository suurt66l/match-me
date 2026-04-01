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

export default function ChatMessage({ isMine, message }: Props) {
    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-xl px-4 py-2 text-sm ${isMine ? "bg-amber-950 text-amber-300" : "bg-amber-500 text-amber-950"}`}>
                {message.content}
                {isMine && (
                    <span className={`ml-2 text-xs select-none ${message.read ? "text-amber-400" : "text-amber-700"}`}>
                        {message.read ? "✓✓" : "✓"}
                    </span>
                )}
            </div>
        </div>
    );
}