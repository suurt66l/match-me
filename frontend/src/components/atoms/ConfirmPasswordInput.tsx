interface Props {
    setConfirmPassword: (value: string) => void;
}

export default function ConfirmPasswordInput({ setConfirmPassword }: Props) {
    return(
        <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-2 -outline-offset-1 outline-white/25 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6"
            onChange={(event) => setConfirmPassword(event.target.value)}
        />
    );
}