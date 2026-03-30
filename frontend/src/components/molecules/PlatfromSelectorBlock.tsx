import CreatableSelect from "react-select/creatable";
import PlatformLabel from "../atoms/PlatformLabel";
import PlatformSelect from "../atoms/PlatformSelect";

interface Option {
  readonly label: string;
  readonly value: string;
}

interface Props {
  setPlatforms: (value: Option[]) => void;
  platformOptions: Option[]
  value: Option[]
}

export default function PlatformSelectBlock({ setPlatforms, platformOptions, value} : Props) {
    return (
            <div>
              <PlatformLabel />
                <div className="mt-2">
                    <CreatableSelect
                        isMulti
                        options={platformOptions}
                        value={value}
                        onChange={(newValue) => setPlatforms(newValue as Option[])}
                        placeholder="Select or type a game..."
                    />
                </div>
            </div>
    )
};