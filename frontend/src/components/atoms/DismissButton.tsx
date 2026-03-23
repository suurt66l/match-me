interface Props {
    onDismiss: () => void;
}

export default function DismissButton({ onDismiss }: Props) {
    return(
        <>
            <button onClick={onDismiss}
                className="flex-1 rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                Dismiss
            </button>
        </>
    )
};