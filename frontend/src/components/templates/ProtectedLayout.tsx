import { Outlet } from "react-router-dom";
import Logo from "../atoms/Logo";
import NavMenu from "../organisms/NavMenu";

interface Props {
    children: React.ReactNode;
}

export default function ProtectedLayout() {
    return (
        <div>
            { /* Neader */}
            <div className="flex items-center min-w-screen bg-amber-600"> 
                <Logo />
            </div>
            <div className="flex">
                { /* SideBar */}
                <div className="w-64 min-h-screen bg-amber-300"> 
                    <NavMenu />
                </div>
                
                { /* Main Zone */}
                <div className="flex-1 items-center justify-center min-h-screen bg-amber-300">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}