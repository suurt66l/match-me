import GenderLabel from "../atoms/GenderLabel";
import GenderSelect from "../atoms/GenderSelect";
interface Props {
  setGender: (value: string) => void;
}

export default function GenderSelectBlock({setGender} : Props) {
    return (
            <div>
              <GenderLabel />
              <div className="mt-2">
                <GenderSelect setGender={setGender} />
              </div>
            </div>
    )
};