import { Link } from "react-router-dom";

export default function TestLink() {
    return(
        <Link to="/test" className="font-semibold text-amber-800 hover:text-amber-700"> Test </Link>
    );
}