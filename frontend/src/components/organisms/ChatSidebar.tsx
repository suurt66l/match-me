import { API_URL } from "../../utils/api";
import defaultAvatar from "../../assets/default-avatar.svg";

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
    unreadCounts: Record<number, number>;
    onSelect: (id: number) => void;
}

export default function ChatSidebar({ connections, activeId, unreadCounts, onSelect } : Props){
    return(
        <div className={`bg-amber-400 flex-col w-full sm:w-64 sm:shrink-0 ${activeId ? "hidden sm:flex" : "flex"}`}>
            <p className="text-amber-950 font-bold px-4 py-4 text-lg">Messages</p>
            <div className="flex flex-col gap-1 px-2 overflow-y-auto">
                {connections.map(user => {
                    const unread = unreadCounts[user.id] ?? 0;
                    return (
                        <button
                        key={user.id}
                        onClick={() => onSelect(user.id)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left ${activeId === user.id ? "bg-amber-950 text-amber-300" : "text-amber-950 hover:bg-amber-500"}`}
                        >
                        <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-full bg-amber-950 overflow-hidden">
                            <img
                                src={user.avatarUrl ? `${API_URL}${user.avatarUrl}` : defaultAvatar}
                                alt={user.nickname}
                                className="w-full h-full object-cover"
                            />
                            </div>
                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-amber-400 ${user.isOnline ? "bg-green-400" : "bg-gray-500"}`} />
                        </div>
                        <span className="text-sm font-semibold truncate flex-1">{user.nickname}</span>
                        {unread > 0 && (
                            <span className="ml-auto shrink-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unread > 9 ? "9+" : unread}
                            </span>
                        )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}