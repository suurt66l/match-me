export default function PasswordInput() {
    return(
        <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-2 -outline-offset-1 outline-white/25 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6"
        />
    );
}