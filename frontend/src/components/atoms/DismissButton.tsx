interface Props {
    handleDismiss: () => void;
}

export default function DismissButton({ handleDismiss }: Props) {
    return(
        <>
            <button onClick={handleDismiss}
                className="rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                Dismiss
            </button>
        </>
    )
};