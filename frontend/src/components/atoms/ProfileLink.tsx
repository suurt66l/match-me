import { Link } from "react-router-dom";

interface Props {
    onMenuToggle?: () => void;
}

export default function ProfileLink( {onMenuToggle} : Props ) {
    return(
        <Link 
            to="/profile" 
            onClick={onMenuToggle} 
            className="flex w-full justify-center rounded-md bg-amber-950 px-3 py-1.5 my-2 text-sm/6 font-semibold text-white hover:bg-amber-900"> 
            Profile 
        </Link>
    );
}