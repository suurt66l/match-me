import HamburgerButton from "../atoms/HamburgerButton";
import Logo from "../atoms/Logo";

interface Props {
    onMenuToggle: () => void;
}

export default function Header( { onMenuToggle } : Props ) {
    return(
        <div className="flex items-center w-full px-4 py-2 gap-3">
            <Logo />
            <div className="flex-1 flex justify-end">
                <HamburgerButton onMenuToggle={onMenuToggle} />
            </div>
        </div>
    );
}