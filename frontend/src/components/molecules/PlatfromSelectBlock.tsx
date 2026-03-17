import PlatformLabel from "../atoms/PlatformLabel";
import PlatformSelect from "../atoms/PlatformSelect";

interface Props {
  setPlatform: (value: string) => void;
  value: string;
}

export default function PlatformSelectBlock({setPlatform, value} : Props) {
    return (
            <div>
              <PlatformLabel />
              <div className="mt-2">
                <PlatformSelect
                  setPlatform={setPlatform}
                  value={value}
                />
              </div>
            </div>
    )
};