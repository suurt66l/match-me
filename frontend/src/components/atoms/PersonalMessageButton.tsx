interface Props {
    redirectToPm: () => void;
}

export default function DismissButton({ redirectToPm }: Props) {
    return(
        <>
            <button onClick={redirectToPm}
                className="rounded-md bg-amber-950 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-900"
                >
                PM
            </button>
        </>
    )
};