interface Props {
    setGames: (value: string) => void;
}

export default function GamesInput({setGames} : Props) {
    return(
        <textarea
            id="games"
            name="games"
            required
            placeholder="CS:GO, Dota 2, Minecraft"
            className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-2 -outline-offset-1 outline-white/25 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6"
            onChange={(event) => setGames(event.target.value)}
        />
    );
}