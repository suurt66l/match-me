import ChatContact from "../molecules/ChatContact";

interface Connection {
    connectionId: number;
    id: number;
    nickname: string;
    avatarUrl: string | null;
    isOnline: boolean;
}

interface Props {
    connections: Connection[];
    activeId: number | null;
    unreadCounts: Record<number, number>;
    onSelect: (id: number) => void;
}

export default function ChatSidebar({ connections, activeId, unreadCounts, onSelect }: Props) {
    return (
        <div className={`bg-amber-400 flex-col w-full sm:w-64 sm:shrink-0 ${activeId ? "hidden sm:flex" : "flex"}`}>
            <p className="text-amber-950 font-bold px-4 py-4 text-lg">Messages</p>
            <div className="flex flex-col gap-1 px-2 overflow-y-auto">
                {connections.map(user => (
                    <ChatContact
                        key={user.id}
                        user={user}
                        isActive={activeId === user.id}
                        unread={unreadCounts[user.id] ?? 0}
                        onSelect={() => onSelect(user.id)}
                    />
                ))}
            </div>
        </div>
    );
}
