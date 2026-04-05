interface Props {
    setGameTimeFrom: (value: string) => void;
    value: string;
}

export default function GameTimeFromInput({setGameTimeFrom, value} : Props) {
    return(
        <input
            id="game-time-from"
            name="game-time-from"
            type="time"
            value={value}
            className="block w-full rounded-md bg-amber-200 px-3 py-1.5 text-base text-amber-950 outline-2 -outline-offset-1 outline-amber-400 placeholder:text-amber-700 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6"
            onChange={(event) => setGameTimeFrom(event.target.value)}
        />
    );
}