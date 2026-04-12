import Avatar from "../atoms/Avatar";
import OnlineStatus from "../atoms/OnlineStatus";
import UnreadBadge from "../atoms/UnreadBadge";

interface Connection {
    id: number;
    nickname: string;
    avatarUrl: string | null;
    isOnline: boolean;
}

interface Props {
    user: Connection;
    isActive: boolean;
    unread: number;
    onSelect: () => void;
}

export default function ChatContact({ user, isActive, unread, onSelect }: Props) {
    return (
        <button
            onClick={onSelect}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left ${isActive ? "bg-amber-950 text-amber-300" : "text-amber-950 hover:bg-amber-500"}`}
        >
            <div className="relative shrink-0">
                <Avatar avatarUrl={user.avatarUrl} size="w-9 h-9" />
                <OnlineStatus isOnline={user.isOnline} />
            </div>
            <span className="text-sm font-semibold truncate flex-1">{user.nickname}</span>
            <UnreadBadge count={unread} />
        </button>
    );
}
