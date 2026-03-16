import IntensityInput from "../atoms/IntensityInput";
import IntensityLabel from "../atoms/IntensityLabel";

interface Props {
  setIntensity: (value: string) => void;
}

export default function IntensityInputBlock({setIntensity} : Props) {
    return (
            <div>
            <IntensityLabel />
              <div className="mt-2">
                <IntensityInput 
                  setIntensity={setIntensity}
                />
              </div>
            </div>
    )
};