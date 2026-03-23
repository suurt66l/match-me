interface Props {
    onMessage: () => void;
}

export default function PersonalMessageButton({ onMessage }: Props) {
    return(
        <>
            <button onClick={onMessage}
                className="flex-1 rounded-md bg-amber-950 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-900"
                >
                PM
            </button>
        </>
    )
};