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
            className="block w-full rounded-md bg-amber-200 px-3 py-1.5 text-base text-amber-950 outline-2 -outline-offset-1 outline-amber-400 placeholder:text-amber-700 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6"
            onChange={(event) => setConfirmPassword(event.target.value)}
        />
    );
}