import PasswordLabel from "../atoms/PasswordLabel"
import PasswordInput from "../atoms/PasswordInput"
import ForgotPasswordLink from "../atoms/ForgotPasswordLink";

export default function PasswordInputBlock() {
    return (
        <div>
          <div className="flex items-center justify-between">
              <PasswordLabel />
              <div className="text-sm">
                <ForgotPasswordLink />
              </div>
            </div>
            <div className="mt-2">
              <PasswordInput />
            </div>
      </div>
    );
}