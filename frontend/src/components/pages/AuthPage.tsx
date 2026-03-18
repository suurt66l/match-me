import { useState } from "react";
import Logo from "../atoms/Logo";
import AuthSection from "../organisms/AuthSection";
import { useAuth } from "../../utils/AuthContext";

export default function AuthPage() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();

    async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        const response = await login({ email, password });

        if(response.status !== 200) {
            setError(response.message ?? "Something went wrong.")
            return;
        }
    }

    return (
        <div>
            <AuthSection
                setEmail={setEmail}
                setPassword={setPassword}
                error={error}
                onSubmit={handleSubmit}
            />
        </div>
    );
}