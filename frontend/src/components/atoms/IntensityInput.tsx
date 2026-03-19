interface Props {
    setIntensity: (value: string) => void;
    value: string;
}

export default function IntensityInput({setIntensity, value} : Props) {
    return(
        <input
            id="intensity"
            name="intensity"
            type="range"
            min={1}
            max={10}
            value={value || "5"}
            className="block w-full cursor-pointer accent-amber-700"
            onChange={(event) => setIntensity(event.target.value)}
        />
    );
}