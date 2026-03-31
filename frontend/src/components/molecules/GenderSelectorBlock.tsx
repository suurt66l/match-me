import GenderLabel from "../atoms/GenderLabel";
import SingleSelect from "../atoms/SingleSelect";

interface Option {
  readonly label: string;
  readonly value: string;
}

interface Props {
  setGender: (value: Option) => void;
  options: Option[]
  value: Option | null;
}

export default function GenderSelectorBlock({setGender, options, value} : Props) {
    return (
            <div>
              <GenderLabel />
              <div className="mt-2">
                <SingleSelect
                  onChange={setGender}
                  options={options}
                  value={value}
                  placeholder="Select gender"
                />
              </div>
            </div>
    )
};