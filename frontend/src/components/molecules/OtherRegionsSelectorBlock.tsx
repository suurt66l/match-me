import OtherRegionsLabel from "../atoms/OtherRegionsLabel";
import MultiSelectFixed from "../atoms/MultiSelectFixed";

interface Option {
  readonly label: string;
  readonly value: string;
}

interface Props {
  setRegions: (value: Option[]) => void;
  options: Option[];
  value: Option[];
}

export default function OtherRegionsSelectorBlock({ setRegions, options, value }: Props) {
    return (
        <div>
          <OtherRegionsLabel />
          <div className="mt-2">
            <MultiSelectFixed
              onChange={setRegions}
              options={options}
              value={value}
            />
          </div>
        </div>
    );
}
