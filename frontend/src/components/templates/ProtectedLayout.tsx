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
                <div className={`absolute z-50 w-64 bg-amber-500 ${isMenuOpen ? "block" : "hidden"} lg:block lg:relative`}>
                    <NavMenu onMenuToggle = {toggleMenu} />
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