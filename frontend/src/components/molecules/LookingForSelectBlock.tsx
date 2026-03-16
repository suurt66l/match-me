import LookingForLabel from "../atoms/LookingForLabel";
import LookingForSelect from "../atoms/LookingForSelect";
interface Props {
  setLookingFor: (value: string) => void;
}

export default function LookingForInputBlock({setLookingFor} : Props) {
    return (
            <div>
              <LookingForLabel />
              <div className="mt-2">
                <LookingForSelect 
                setLookingFor={setLookingFor}
                />
              </div>
            </div>
    )
};