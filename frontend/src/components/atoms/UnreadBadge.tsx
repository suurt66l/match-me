interface Props {
    count: number;
}

export default function UnreadBadge({ count }: Props) {
    if (count === 0) return null;

    return (
        <span className="ml-auto shrink-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {count > 9 ? "9+" : count}
        </span>
    );
}
