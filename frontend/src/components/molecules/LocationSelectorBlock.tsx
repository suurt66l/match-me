import ContinentLabel from "../atoms/ContinentLabel";
import ContinentSelect from "../atoms/ContinentSelect";
import SingleSelect from "../atoms/SingleSelect";

interface Option {
  readonly label: string;
  readonly value: string;
}

interface Props {
  setContinent: (value: Option) => void;
  options: Option[]
  value: Option | null;
}

export default function LocationSelectorBlock({setContinent, options, value} : Props) {
    return (
            <div>
              <ContinentLabel />
              <div className="mt-2">
                <SingleSelect
                  onChange={setContinent}
                  options={options}
                  value={value}
                  placeholder="Select continent"
                />
              </div>
            </div>
    )
};