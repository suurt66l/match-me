import PasswordInput from "../atoms/PasswordInput";
import CurrentPasswordLabel from "../atoms/CurrentPasswordLabel";

interface Props {
    setPassword: (value: string) => void;
}

export default function CurrentPasswordInputBlock({ setPassword }: Props) {
    return (
        <div>
            <CurrentPasswordLabel />
            <div className="mt-2">
                <PasswordInput setPassword={setPassword} mode="login" />
            </div>
        </div>
    );
}
