interface Props {
    setPlatform: (value: string) => void;
}

export default function PlatformSelect({setPlatform} : Props) {
    return(
        <select id="platform"
                name="platform"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-2 -outline-offset-1 outline-white/25 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6" 
                onChange={(event) => setPlatform(event.target.value) }>
            <option value="">Select platform</option>
            <option value="pc">PC</option>
            <option value="playstation">PlayStation</option>
            <option value="xbox">Xbox</option>
            <option value="nintendo">Nintendo</option>
            <option value="other">Other</option>
        </select>
    );
}