import { useState } from "react";
import Logo from "../atoms/Logo";
import RegistrationSection from "../organisms/RegistrationSection";
import { useAuth } from "../../utils/AuthContext";

export default function RegistrationPage() {
    const [nickname, setNickname] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { register } = useAuth();

    async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        //Additional check for password integrity
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return;
        }

        const response = await register({ nickname, email, password });

        if(response.status !== 200) {
            setError(response.message ?? "Something went wrong.")
            return;
        }
    }

    return (
        <div>
            { /* Navbar */}
            <div className="flex items-center min-w-screen bg-amber-600">
                <Logo/>
            </div>
            { /* Main Zone */}
            <div className="flex items-center justify-center min-h-screen bg-amber-300">
            <RegistrationSection
                setNickname={setNickname}
                setEmail={setEmail}
                setPassword={setPassword}
                setConfirmPassword={setConfirmPassword}
                onSubmit={handleSubmit}
                error={error}
            />
            </div>
        </div>
    );
}