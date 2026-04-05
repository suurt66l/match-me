interface Props {
    onBlock: () => void;
}

export default function BlockButton({ onBlock }: Props) {
    function handleClick() {
        if (window.confirm("Block this user? They will never appear in your recommendations again.")) {
            onBlock();
        }
    }

    return(
        <>
            <button onClick={handleClick}
                className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                Block
            </button>
        </>
    )
};