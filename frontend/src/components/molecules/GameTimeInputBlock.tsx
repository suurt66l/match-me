import GameTimeLabel from "../atoms/GameTimeLabel";
import GameTimeFromInput from "../atoms/GameTimeFromInput";
import GameTimeFromLabel from "../atoms/GameTimeFromLabel";
import GameTimeToInput from "../atoms/GameTimeToInput";
import GameTimeToLabel from "../atoms/GameTimeToLabel";
import TimeZoneLabel from "../atoms/TimeZoneLabel";
import TimeZoneSelect from "../atoms/TimeZoneSelect";

interface Props {
  setGameTimeFrom: (value: string) => void;
  setGameTimeTo: (value: string) => void;
  setTimeZone: (value: string) => void;
  gameTimeFrom: string;
  gameTimeTo: string;
  timeZone: string;
}

export default function GameTimeInputBlock({ setGameTimeTo, setGameTimeFrom, setTimeZone, gameTimeFrom, gameTimeTo, timeZone} : Props) {
    return (
            <div>
                <GameTimeLabel />
                    <GameTimeFromLabel />
                    <div className="mt-2">
                        <GameTimeFromInput setGameTimeFrom={setGameTimeFrom} value={gameTimeFrom} />
                    </div>

                    <GameTimeToLabel />
                    <div className="mt-2">
                        <GameTimeToInput setGameTimeTo={setGameTimeTo} value={gameTimeTo} />
                    </div>

                    <TimeZoneLabel />
                    <div className="mt-2">
                        <TimeZoneSelect setTimeZone={setTimeZone} value={timeZone} />
                    </div>
            </div>
    )
};