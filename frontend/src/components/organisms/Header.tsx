import HamburgerButton from "../atoms/HamburgerButton";
import Logo from "../atoms/Logo";

interface Props {
    onMenuToggle: () => void;
}

export default function Header( { onMenuToggle } : Props ) {
    return(
        <div>
            <Logo />
            <HamburgerButton
            onMenuToggle = {onMenuToggle} 
            />
        </div>
    );
}