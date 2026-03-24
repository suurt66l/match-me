interface Props {
    onConnect: () => void;
}

export default function DismissButton({ onConnect }: Props) {
    return(
        <>
            <button onClick={onConnect}
                className="flex-1 rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600"
                >
                Connect
            </button>
        </>
    )
};