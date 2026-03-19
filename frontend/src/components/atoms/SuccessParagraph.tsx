interface Props {
    msg: string;
}

export default function SuccessParagraph({ msg }: Props) {
    return (
        <p className="text-green-700 bg-green-200 rounded-lg px-3 py-1">✓ {msg}</p>
    );
}
