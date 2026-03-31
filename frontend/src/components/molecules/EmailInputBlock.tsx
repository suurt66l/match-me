import EmailInput from "../atoms/EmailInput"
import EmailLabel from "../atoms/EmailLabel"
interface Props {
  value?: string;
  setEmail: (value: string) => void;
}

export default function EmailInputBlock({value, setEmail} : Props) {
    return (
            <div>
              <EmailLabel />
              <div className="mt-2">
                <EmailInput
                  value={value}
                  setEmail={setEmail}
                />
              </div>
            </div>
    )
};