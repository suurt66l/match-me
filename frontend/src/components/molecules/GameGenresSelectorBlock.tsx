import CreatableSelect from "react-select/creatable";
import GameGenresLabel from "../atoms/GameGenresLabel";

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
                    <CreatableSelect
                        isMulti
                        options={genreOptions}
                        value={value}
                        onChange={(newValue) => setGameGenres(newValue as Option[])}
                        placeholder="Select or type a game..."
                    />
                </div>
            </div>
    )
};