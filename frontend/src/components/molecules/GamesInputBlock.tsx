import GamesInput from "../atoms/GamesInput";
import GamesLabel from "../atoms/GamesLabel";

interface Props {
  setGames: (value: string) => void;
  value: string;
}

export default function GamesInputBlock({ setGames, value} : Props) {
    return (
            <div>
                <GamesLabel />
                <div className="mt-2">
                    <GamesInput setGames={setGames} value={value} />
                </div>
            </div>
    )
};