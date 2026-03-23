import EmailInput from "../atoms/EmailInput"
import EmailLabel from "../atoms/EmailLabel"
interface Props {
  setEmail: (value: string) => void;
}

export default function EmailInputBlock({setEmail} : Props) {
    return (
            <div>
              <EmailLabel />
              <div className="mt-2">
                <EmailInput
                  setEmail={setEmail}
                />
              </div>
            </div>
    )
};