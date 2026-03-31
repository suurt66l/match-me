

interface Props {
    isMine: boolean,
    message: {
        senderId: number;
        recipientId: number;
        content: string;
        timestamp: string;
    }
}

export default function ChatMessage({isMine, message}: Props){
    return(
        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-xl px-4 py-2 text-sm ${isMine ? "bg-amber-950 text-amber-300" : "bg-amber-500 text-amber-950"}`}>
                {message.content}
            </div>
        </div>
    );
}