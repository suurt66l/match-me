import { useState } from "react";
import Logo from "../atoms/Logo";
import AuthSection from "../organisms/AuthSection";
import { useAuth } from "../../utils/AuthContext";

interface Props {
    setToken: (token: string) => void;
}

interface Credentials {
    email: string,
    password: string
}

export default function AuthPage({setToken} : Props) {
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

        setToken(response.token!);
    }

    return (
        <div>
            { /* Navbar */}
            <div className="flex items-center min-w-screen bg-amber-600">
                <Logo/>
            </div>
            { /* Main Zone */}
            <div className="flex items-center justify-center min-h-screen bg-amber-300">
            <AuthSection
                setEmail={setEmail}
                setPassword={setPassword}
                error={error}
                onSubmit={handleSubmit}
            />
            </div>
        </div>
    );
}