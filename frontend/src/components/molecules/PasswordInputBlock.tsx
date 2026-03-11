import PasswordLabel from "../atoms/PasswordLabel"
import PasswordInput from "../atoms/PasswordInput"
import ForgotPasswordLink from "../atoms/ForgotPasswordLink";

interface Props {
  setPassword: (value: string) => void;
  showForgotPassword?: boolean;
}

export default function PasswordInputBlock({setPassword, showForgotPassword} : Props) {
    return (
        <div>
          <div className="flex items-center justify-between">
              <PasswordLabel />
              <div className="text-sm">
                { showForgotPassword ? <ForgotPasswordLink /> : null }
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