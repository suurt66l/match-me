import PasswordLabel from "../atoms/PasswordLabel"
import PasswordInput from "../atoms/PasswordInput"
import ForgotPasswordLink from "../atoms/ForgotPasswordLink";

interface Props {
  setPassword: (value: string) => void;
}

export default function PasswordInputBlock({setPassword} : Props) {
    return (
        <div>
          <div className="flex items-center justify-between">
              <PasswordLabel />
              <div className="text-sm">
                <ForgotPasswordLink />
              </div>
            </div>
            <div className="mt-2">
              <PasswordInput 
                setPassword={setPassword}
              />
            </div>
      </div>
    );
}