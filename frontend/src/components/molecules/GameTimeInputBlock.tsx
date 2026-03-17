import GameTimeLabel from "../atoms/GameTimeLabel";
import GameTimeFromInput from "../atoms/GameTimeFromInput";
import GameTimeFromLabel from "../atoms/GameTimeFromLabel";
import GameTimeToInput from "../atoms/GameTimeToInput";
import GameTimeToLabel from "../atoms/GameTimeToLabel";

interface Props {
  setGameTimeFrom: (value: string) => void;
  setGameTimeTo: (value: string) => void;
  gameTimeFrom: string;
  gameTimeTo: string;
}

export default function GameTimeInputBlock({ setGameTimeTo, setGameTimeFrom, gameTimeFrom, gameTimeTo} : Props) {
    return (
            <div>
                <GameTimeLabel />
                <div>
                    <GameTimeFromLabel />
                    <div className="mt-2">
                        <GameTimeFromInput setGameTimeFrom={setGameTimeFrom} value={gameTimeFrom} />
                    </div>
                </div>

                    <GameTimeToLabel />
                    <div className="mt-2">
                        <GameTimeToInput setGameTimeTo={setGameTimeTo} value={gameTimeTo} />
                </div>
            </div>
    )
};