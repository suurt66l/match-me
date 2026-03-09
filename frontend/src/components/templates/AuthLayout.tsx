import Logo from "../atoms/Logo";
import AuthSection from "../organisms/AuthSection";

export default function AuthLayout() {
    return (
        <div>
            { /* Navbar */}
            <div className="flex items-center min-w-screen bg-amber-600">
                <Logo/>
            </div>
            { /* Main Zone */}
            <div className="flex items-center justify-center min-h-screen bg-amber-300">
                    <AuthSection />
            </div>
        </div>
    );
}