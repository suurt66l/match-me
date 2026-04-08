import PasswordInput from "../atoms/PasswordInput";
import NewPasswordLabel from "../atoms/NewPasswordLabel";

interface Props {
    setPassword: (value: string) => void;
}

export default function NewPasswordInputBlock({ setPassword }: Props) {
    return (
        <div>
            <NewPasswordLabel />
            <div className="mt-2">
                <PasswordInput 
                setPassword={setPassword} 
                mode="register" />
            </div>
        </div>
    );
}
