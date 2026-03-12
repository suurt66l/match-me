interface Props {
    label: string;
}

export default function Button(label : Props) {
    return(
        <div>
            <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-amber-950 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-amber-900"
                >

            </button>
        </div>
    )
};