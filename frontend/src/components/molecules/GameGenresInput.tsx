import GameGenresInput from "../atoms/GameGenresInput";
import GameGenresLabel from "../atoms/GameGenresLabel";

interface Props {
  setGameGenres: (value: string) => void;
  value: string;
}

export default function GameGenresInputBlock({ setGameGenres, value} : Props) {
    return (
            <div>
                <GameGenresLabel />
                <div className="mt-2">
                    <GameGenresInput setGameGenres={setGameGenres} value={value} />
                </div>
            </div>
    )
};