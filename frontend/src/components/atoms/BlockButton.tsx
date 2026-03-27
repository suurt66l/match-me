interface Props {
    onBlock: () => void;
}

export default function BlockButton({ onBlock }: Props) {
    return(
        <>
            <button onClick={onBlock}
                className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                Block
            </button>
        </>
    )
};