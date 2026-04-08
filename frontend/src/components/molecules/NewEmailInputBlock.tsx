import EmailInput from "../atoms/EmailInput";
import NewEmailLabel from "../atoms/NewEmailLabel";

interface Props {
    value: string;
    setEmail: (value: string) => void;
}

export default function NewEmailInputBlock({ value, setEmail }: Props) {
    return (
        <div>
            <NewEmailLabel />
            <div className="mt-2">
                <EmailInput 
                    value={value} 
                    setEmail={setEmail} />
            </div>
        </div>
    );
}
