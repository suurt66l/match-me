import PreferredGenderLabel from "../atoms/PreferredGenderLabel";
import MultiSelectFixed from "../atoms/MultiSelectFixed";

interface Option {
  readonly label: string;
  readonly value: string;
}

interface Props {
  setGenders: (value: Option[]) => void;
  options: Option[];
  value: Option[];
}

export default function PreferredGenderSelectorBlock({ setGenders, options, value }: Props) {
    return (
        <div>
          <PreferredGenderLabel />
          <div className="mt-2">
            <MultiSelectFixed
              onChange={setGenders}
              options={options}
              value={value}
              placeholder="Any gender"
            />
          </div>
        </div>
    );
}
