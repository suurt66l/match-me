import ConfirmPasswordLabel from "../atoms/ConfirmPasswordLabel"
import ConfirmPasswordInput from "../atoms/ConfirmPasswordInput"

interface Props {
  setConfirmPassword: (value: string) => void;
}

export default function ConfirmPasswordBlock({setConfirmPassword }: Props) {
    return (
        <div>
          <div className="flex items-center justify-between">
              <ConfirmPasswordLabel />
            </div>
            <div className="mt-2">
              <ConfirmPasswordInput 
                setConfirmPassword={setConfirmPassword}
              />
            </div>
      </div>
    );
}