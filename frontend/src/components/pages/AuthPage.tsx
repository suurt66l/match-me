import { useState } from "react";
import Logo from "../atoms/Logo";
import AuthSection from "../organisms/AuthSection";

interface Props {
    setToken: (token: string) => void;
}

interface Credentials {
    email: string,
    password: string
}

interface LoginResponse {
    token? : string;
    message? : string;
    status: number;
}

async function loginUser(credentials: Credentials) : Promise<LoginResponse> {
    console.log("Credentials: " + credentials.email + " " + credentials.password)

    const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    
    const data = await response.json();

    return {
        token: data.token,
        message: data.message,
        status: response.status
    }
}

export default function AuthPage({setToken} : Props) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        const response = await loginUser({ email, password });
        
        //LOGS
        console.log("Response Token 2: " + response.token)

        if(response.status !== 200) {
            setError(response.message ?? "Something went wrong.")
            return;
        }
        //LOGS
        console.log("Response Token 3: " + response.token)

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