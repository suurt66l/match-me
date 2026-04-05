interface Props {
    setCity: (value: string) => void;
    value: string;
}

export default function CityInput({setCity, value} : Props) {
    return(
        <input
            id="city"
            name="city"
            type="text"
            autoComplete="address-level2"
            value={value}
            className="block w-full rounded-md bg-amber-200 px-3 py-1.5 text-base text-amber-950 outline-2 -outline-offset-1 outline-amber-400 placeholder:text-amber-700 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6"
            onChange={(event) => setCity(event.target.value)}
        />
    );
}