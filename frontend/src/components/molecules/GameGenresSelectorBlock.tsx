import CreatableSelect from "react-select/creatable";
import GameGenresLabel from "../atoms/GameGenresLabel";
import MultiSelect from "../atoms/MultiSelect";

interface Option {
  readonly label: string;
  readonly value: string;
}

interface Props {
  setGameGenres: (value: Option[]) => void;
  genreOptions: Option[]
  value: Option[]
}

export default function GameGenresInputBlock({ setGameGenres, genreOptions, value} : Props) {
    return (
            <div>
                <GameGenresLabel />
                <div className="mt-2">
                    <MultiSelect 
                        options={genreOptions}
                        value={value}
                        onChange={(newValue) => setGameGenres(newValue as Option[])}
                        placeholder="Select or type a game..."
                    />
                </div>
            </div>
    )
};