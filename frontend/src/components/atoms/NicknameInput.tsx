interface Props {
    setNickname: (value: string) => void;
    value: string;
}

export default function NicknameInput({setNickname, value} : Props) {
    return(
        <input
            id="nickname"
            name="nickname"
            type="text"
            required
            autoComplete="nickname"
            value={value}
            className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-2 -outline-offset-1 outline-white/25 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6"
            onChange={(event) => setNickname(event.target.value)}
        />
    );
}