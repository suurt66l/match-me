interface Props {
    onCancel: () => void;
}

export default function CancelButton({ onCancel }: Props) {
    return(
        <>
            <button onClick={onCancel}
                className="flex-1 rounded-md bg-amber-950 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-900"
                >
                Cancel
            </button>
        </>
    )
};