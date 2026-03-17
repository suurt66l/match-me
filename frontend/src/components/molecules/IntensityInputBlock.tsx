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
                <IntensityInput setIntensity={setIntensity} value={value} />
                <div className="flex justify-between mt-1 text-xs text-gray-100">
                    <span>For fun</span>
                    <span className="font-bold">{value || "5"} / 10</span>
                    <span>Sweaty</span>
                </div>
            </div>
        </div>
    )
};