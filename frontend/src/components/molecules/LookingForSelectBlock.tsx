import LookingForLabel from "../atoms/LookingForLabel";
import LookingForSelect from "../atoms/LookingForSelect";
interface Props {
  setLookingFor: (value: string) => void;
  value: string;
}

export default function LookingForInputBlock({setLookingFor, value} : Props) {
    return (
            <div>
              <LookingForLabel />
              <div className="mt-2">
                <LookingForSelect
                  setLookingFor={setLookingFor}
                  value={value}
                />
              </div>
            </div>
    )
};