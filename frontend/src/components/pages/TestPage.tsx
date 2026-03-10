import Logo from "../atoms/Logo";

export default function TestPage(){
    return (
        <div>
            { /* Navbar */}
            <div className="flex items-center min-w-screen bg-amber-600">
                <Logo/>
            </div>
            { /* Main Zone */}
            <div className="flex items-center justify-center min-h-screen bg-amber-300">
                <h1> MATCHER PAGE </h1>
            </div>
        </div>
    );
}