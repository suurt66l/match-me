import LookingForLabel from "../atoms/LookingForLabel";
import MultiSelectFixed from "../atoms/MultiSelectFixed";

interface Option {
  readonly label: string;
  readonly value: string;
}

interface Props {
  setLookingFor: (value: Option[]) => void;
  lookingForOptions: Option[]
  value: Option[];
}

export default function LookingForSelectBlock({setLookingFor, lookingForOptions, value}: Props) {
    return (
            <div>
              <LookingForLabel />
              <div className="mt-2">
                <MultiSelectFixed
                  onChange={setLookingFor}
                  options={lookingForOptions}
                  value={value}
                />
              </div>
            </div>
    )
};