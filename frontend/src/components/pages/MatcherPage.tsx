import Logo from "../atoms/Logo";
import NavMenu from "../organisms/NavMenu";

export default function AuthPage() {
    
    return (
        <div>
            { /* Navbar */}
            <div className="flex items-center min-w-screen bg-amber-600">
                <Logo/>
            </div>
            { /* Main Zone */}
            <div className="flex items-center justify-center min-h-screen bg-amber-300">
                <h1> MATCHER PAGE </h1>
                <NavMenu />
            </div>
        </div>
    );
}