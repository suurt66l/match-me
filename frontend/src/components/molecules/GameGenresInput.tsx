import GameGenresInput from "../atoms/GameGenresInput";
import GameGenresLabel from "../atoms/GameGenresLabel";

interface Props {
  setGameGenres: (value: string) => void;
}

export default function GameGenresInputBlock({ setGameGenres} : Props) {
    return (
            <div>        
                <GameGenresLabel />
                <div className="mt-2">
                    <GameGenresInput setGameGenres={setGameGenres} />
                </div>
            </div>
    )
};