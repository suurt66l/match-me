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
            className="block w-full rounded-md bg-amber-200 px-3 py-1.5 text-base text-amber-950 outline-2 -outline-offset-1 outline-amber-400 placeholder:text-amber-700 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6"
            onChange={(event) => setPassword(event.target.value)}
        />
    );
}