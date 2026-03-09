export default function SubmitButton() {
    return(
        <div>
            <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-amber-950 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-amber-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                Sign in
            </button>
        </div>
    )
};