interface Connection {
    connectionId: number;
    id: number;
    nickname: string;
    avatarUrl: string | null;
    isOnline: boolean;
};

interface Props {
    connections: Connection[];
    activeId: number | null;
    onSelect: (id: number) => void;
}

export default function ChatSidebar({ connections, activeId, onSelect } : Props){
    return(
        <div className={`bg-amber-400 flex-col w-full sm:w-64 sm:shrink-0 ${activeId ? "hidden sm:flex" : "flex"}`}>
            <p className="text-amber-950 font-bold px-4 py-4 text-lg">Messages</p>
            <div className="flex flex-col gap-1 px-2 overflow-y-auto">
                {connections.map(user => (
                    <button
                    key={user.id}
                    onClick={() => onSelect(user.id)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left ${activeId === user.id ? "bg-amber-950 text-amber-300" : "text-amber-950 hover:bg-amber-500"}`}
                    >
                    <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-amber-950 overflow-hidden">
                        <img
                            src={user.avatarUrl ? `http://localhost:8080${user.avatarUrl}` : "/assets/default-avatar.svg"}
                            alt={user.nickname}
                            className="w-full h-full object-cover"
                        />
                        </div>
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-amber-400 ${user.isOnline ? "bg-green-400" : "bg-gray-500"}`} />
                    </div>
                    <span className="text-sm font-semibold truncate">{user.nickname}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}