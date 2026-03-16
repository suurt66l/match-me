import { countries } from "../../data/countries";

interface Props {
    setCountry: (value: string) => void;
}

export default function CountrySelect({setCountry} : Props) {
    return(
        <select id="country"
                name="country"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-2 -outline-offset-1 outline-white/25 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6" 
                onChange={(event) => setCountry(event.target.value) }>
            <option value="">Select country</option>
            {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
            ))}
        </select>
    );
}