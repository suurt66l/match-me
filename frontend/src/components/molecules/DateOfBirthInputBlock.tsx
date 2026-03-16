import DateOfBirthInput from "../atoms/DateOfBirthInput";
import DateOfBirthLabel from "../atoms/DateOfBirthLabel";

interface Props {
  setDateOfBirth : (value: string) => void;
}

export default function DateOfBirthInputBlock({setDateOfBirth} : Props) {
    return (
            <div>
              <DateOfBirthLabel />
              <div className="mt-2">
                <DateOfBirthInput setDateOfBirth ={setDateOfBirth} />
              </div>
            </div>
    )
};