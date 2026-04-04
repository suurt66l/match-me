interface Props {
    setGameGenres: (value: string) => void;
    value: string;
}

export default function GameGenresInput({setGameGenres, value} : Props) {
    return(
        <textarea
            id="game-genres"
            name="game-genres"
            placeholder="FPS, MOBA, Sandbox"
            value={value}
            className="block w-full rounded-md bg-amber-200 px-3 py-1.5 text-base text-amber-950 outline-2 -outline-offset-1 outline-amber-400 placeholder:text-amber-700 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6"
            onChange={(event) => setGameGenres(event.target.value)}
        />
    );
}