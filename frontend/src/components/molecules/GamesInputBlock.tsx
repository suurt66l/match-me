import GamesInput from "../atoms/GamesInput";
import GamesLabel from "../atoms/GamesLabel";

interface Props {
  setGames: (value: string) => void;
}

export default function GamesInputBlock({ setGames} : Props) {
    return (
            <div>        
                <GamesLabel />
                <div className="mt-2">
                    <GamesInput setGames={setGames} />
                </div>
            </div>
    )
};