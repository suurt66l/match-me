import GenderLabel from "../atoms/GenderLabel";
import GenderSelect from "../atoms/GenderSelect";
interface Props {
  setGender: (value: string) => void;
  value: string;
}

export default function GenderSelectBlock({setGender, value} : Props) {
    return (
            <div>
              <GenderLabel />
              <div className="mt-2">
                <GenderSelect setGender={setGender} value={value} />
              </div>
            </div>
    )
};