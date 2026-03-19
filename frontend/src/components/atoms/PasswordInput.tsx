interface Props {
    setPassword: (value: string) => void;
    mode: string;
}

export default function PasswordInput({setPassword, mode} : Props) {
    return(
        <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-2 -outline-offset-1 outline-white/25 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6"
            onChange={(event) => setPassword(event.target.value)}
        />
    );
}