interface Props {
    isOnline: boolean;
}

export default function OnlineStatus({ isOnline }: Props) {
    return (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-amber-400 ${isOnline ? "bg-green-400" : "bg-gray-500"}`} />
    );
}
