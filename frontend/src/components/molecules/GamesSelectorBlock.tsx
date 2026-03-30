import CreatableSelect from "react-select/creatable";
import GamesLabel from "../atoms/GamesLabel";

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
                    <CreatableSelect
                        isMulti
                        options={gameOptions}
                        value={value}
                        onChange={(newValue) => setGames(newValue as Option[])}
                        placeholder="Select or type a game..."
                    />
                </div>
            </div>
    )
};