import PlatformLabel from "../atoms/PlatformLabel";
import PlatformSelect from "../atoms/PlatformSelect";

interface Props {
  setPlatform: (value: string) => void;
}

export default function PlatformSelectBlock({setPlatform} : Props) {
    return (
            <div>
              <PlatformLabel />
              <div className="mt-2">
                <PlatformSelect 
                setPlatform={setPlatform}
                />
              </div>
            </div>
    )
};