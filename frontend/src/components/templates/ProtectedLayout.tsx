import { Outlet } from "react-router-dom";
import NavMenu from "../organisms/NavMenu";
import { useState } from "react";
import Header from "../organisms/Header";
import { WebSocketProvider } from "../../utils/WebSocketContext";

export default function ProtectedLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function toggleMenu() {
        setIsMenuOpen(!isMenuOpen);
    }

    return (
        <WebSocketProvider>
        <div className="flex flex-col min-h-screen">
            { /* Header */}
            <div className="flex items-center min-w-screen bg-amber-600">
                <Header onMenuToggle = {toggleMenu} />
            </div>
            <div className="relative flex flex-1">
                { /* SideBar */}
                <div className={`absolute right-0 z-50 w-64 ${isMenuOpen ? "block" : "hidden"} lg:block lg:relative lg:right-auto`}>
                    <div className="lg:hidden bg-amber-500/90 rounded-bl-xl shadow-xl px-2 py-2">
                        <NavMenu onMenuToggle={toggleMenu} />
                    </div>
                    <div className="hidden lg:block bg-amber-500 h-full px-2 pt-1">
                        <NavMenu onMenuToggle={toggleMenu} />
                    </div>
                </div>

                { /* Main Zone */}
                <div className="flex-1 bg-amber-300">
                    <Outlet />
                </div>
            </div>
        </div>
    </WebSocketProvider>
    );
}