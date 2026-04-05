interface Props {
    setNickname: (value: string) => void;
    value: string;
}

export default function NicknameInput({value, setNickname} : Props) {
    return(
        <input
            id="nickname"
            name="nickname"
            type="text"
            required
            autoComplete="nickname"
            value={value}
            className="block w-full rounded-md bg-amber-200 px-3 py-1.5 text-base text-amber-950 outline-2 -outline-offset-1 outline-amber-400 placeholder:text-amber-700 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6"
            onChange={(event) => setNickname(event.target.value)}
        />
    );
}