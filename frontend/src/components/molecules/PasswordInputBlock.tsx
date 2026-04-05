import PasswordLabel from "../atoms/PasswordLabel"
import PasswordInput from "../atoms/PasswordInput"
import ForgotPasswordLink from "../atoms/ForgotPasswordLink";

interface Props {
  setPassword: (value: string) => void;
  mode: string;
}

export default function PasswordInputBlock({setPassword, mode} : Props) {
  console.log("mode is:", mode)
    return (
        <div>
          <div className="flex items-center justify-between">
              <PasswordLabel />
              <div className="text-sm">
                {mode === "register" ?  null : <ForgotPasswordLink /> }
              </div>
            </div>
            <div className="mt-2">
              <PasswordInput 
                setPassword={setPassword}
                mode={mode}
              />
            </div>
      </div>
    );
}