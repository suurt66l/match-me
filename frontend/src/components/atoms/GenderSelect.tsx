interface Props {
    setGender: (value: string) => void;
}

export default function GenderSelect({setGender} : Props) {
    return(
        <select id="gender"
                name="gender"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-2 -outline-offset-1 outline-white/25 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6" 
                onChange={(event) => setGender(event.target.value) }>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
        </select>
    );
}