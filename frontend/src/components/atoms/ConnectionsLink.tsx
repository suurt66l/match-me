import { Link } from "react-router-dom";

export default function ConnectionsLink() {
    return(
        <Link 
            to="/connections" 
            className="flex w-full justify-center rounded-md bg-amber-950 px-3 py-1.5 my-2 text-sm/6 font-semibold text-white hover:bg-amber-900"> 
            Connections
        </Link>
    );
}