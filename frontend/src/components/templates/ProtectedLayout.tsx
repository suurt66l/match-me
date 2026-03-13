import { Outlet } from "react-router-dom";
import NavMenu from "../organisms/NavMenu";
import { useState } from "react";
import Header from "../organisms/Header";

export default function ProtectedLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function toggleMenu() {
        setIsMenuOpen(!isMenuOpen);
    }

    return (
        <div>
            { /* Header */}
            <div className="flex items-center min-w-screen bg-amber-600"> 
                <Header onMenuToggle = {toggleMenu} />
            </div>
            <div className="relative flex">
                { /* SideBar */}
                <div className={`absolute w-64 max-h-screen bg-amber-500 ${isMenuOpen ? "block" : "hidden"} lg:block lg:relative `}> 
                    <NavMenu />
                </div>
                
                { /* Main Zone */}
                <div className="flex-1 min-h-screen bg-amber-300">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}