import CreatableSelect from "react-select/creatable";
import GamesLabel from "../atoms/GamesLabel";
import MultiSelect from "../atoms/MultiSelect";

interface Option {
  readonly label: string;
  readonly value: string;
}

interface Props {
  setGames: (value: Option[]) => void;
  gameOptions: Option[]
  value: Option[]
}

export default function GamesInputBlock({ setGames, gameOptions, value} : Props) {
    return (
            <div>
                <GamesLabel />
                <div className="mt-2">
                    <MultiSelect 
                        options={gameOptions}
                        value={value}
                        onChange={(newValue) => setGames(newValue as Option[])}
                        placeholder="Select or type a game..."
                    />
                </div>
            </div>
    )
};