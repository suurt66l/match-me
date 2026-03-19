import EmailInput from "../atoms/EmailInput"
import EmailLabel from "../atoms/EmailLabel"
interface Props {
  setEmail: (value: string) => void;
  value: string;
}

export default function EmailInputBlock({setEmail, value} : Props) {
    return (
            <div>
              <EmailLabel />
              <div className="mt-2">
                <EmailInput
                  setEmail={setEmail}
                  value={value}
                />
              </div>
            </div>
    )
};