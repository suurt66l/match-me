interface Props {
    onAccept: () => void;
}

export default function AcceptButton({ onAccept }: Props) {
    return(
        <>
            <button onClick={onAccept}
                className="flex-1 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
                >
                Accept
            </button>
        </>
    )
};