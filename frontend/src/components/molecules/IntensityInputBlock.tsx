import IntensityInput from "../atoms/IntensityInput";
import IntensityLabel from "../atoms/IntensityLabel";

interface Props {
  setIntensity: (value: string) => void;
  value: string;
}

export default function IntensityInputBlock({setIntensity, value} : Props) {
    return (
            <div>
            <IntensityLabel />
              <div className="mt-2">
                <IntensityInput
                  setIntensity={setIntensity}
                  value={value}
                />
              </div>
            </div>
    )
};