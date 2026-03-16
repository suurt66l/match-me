interface Props {
    setIntensity: (value: string) => void;
}

export default function IntensityInput({setIntensity} : Props) {
    return(
        <input
            id="intensity"
            name="intensity"
            type="range"
            min={1}
            max={10}
            required
            className="block w-full cursor-pointer accent-amber-700"
            onChange={(event) => setIntensity(event.target.value)}
        />
    );
}