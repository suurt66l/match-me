import GameTimeLabel from "../atoms/GameTimeLabel";
import GameTimeFromInput from "../atoms/GameTimeFromInput";
import GameTimeFromLabel from "../atoms/GameTimeFromLabel";
import GameTimeToInput from "../atoms/GameTimeToInput";
import GameTimeToLabel from "../atoms/GameTimeToLabel";
import TimeZoneLabel from "../atoms/TimeZoneLabel";
import SingleSelect from "../atoms/SingleSelect";

interface Option {
  readonly label: string;
  readonly value: string;
}

interface Props {
  setGameTimeFrom: (value: string) => void;
  setGameTimeTo: (value: string) => void;
  setTimeZone: (value: Option) => void;
  gameTimeFrom: string;
  gameTimeTo: string;
  timeZone: Option | null;
  timeZoneOptions: Option[];
}

export default function GameTimeInputBlock({ setGameTimeTo, setGameTimeFrom, gameTimeFrom, gameTimeTo, setTimeZone, timeZone, timeZoneOptions} : Props) {

    return (
            <div>
                <GameTimeLabel />
                    <GameTimeFromLabel />
                    <div className="mt-2">
                        <GameTimeFromInput 
                            setGameTimeFrom={setGameTimeFrom} 
                            value={gameTimeFrom} />
                    </div>

                    <GameTimeToLabel />
                    <div className="mt-2">
                        <GameTimeToInput 
                            setGameTimeTo={setGameTimeTo} 
                            value={gameTimeTo} />
                    </div>

                    <TimeZoneLabel />
                    <div className="mt-2">
                        <SingleSelect 
                            onChange={setTimeZone} 
                            options={timeZoneOptions} 
                            value={timeZone}/>
                    </div>
            </div>
    )
};