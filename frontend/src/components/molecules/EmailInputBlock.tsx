import EmailInput from "../atoms/EmailInput"
import EmailLabel from "../atoms/EmailLabel"
interface Props {
  email: string;
  setEmail: (value: string) => void;
}

export default function EmailInputBlock({email, setEmail} : Props) {
    return (
            <div>
              <EmailLabel />
              <div className="mt-2">
                <EmailInput 
                  email={email}
                  setEmail={setEmail}
                />
              </div>
            </div>
    )
};