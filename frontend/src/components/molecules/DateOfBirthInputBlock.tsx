import DateOfBirthInput from "../atoms/DateOfBirthInput";
import DateOfBirthLabel from "../atoms/DateOfBirthLabel";

interface Props {
  setDateOfBirth: (value: string) => void;
  value: string;
}

export default function DateOfBirthInputBlock({setDateOfBirth, value} : Props) {
    return (
            <div>
              <DateOfBirthLabel />
              <div className="mt-2">
                <DateOfBirthInput setDateOfBirth={setDateOfBirth} value={value} />
              </div>
            </div>
    )
};