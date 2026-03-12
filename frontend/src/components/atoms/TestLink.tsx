import { Link } from "react-router-dom";

export default function TestLink() {
    return(
        <Link to="/test" className="flex w-full justify-center rounded-md bg-amber-950 px-3 py-1.5 my-2 text-sm/6 font-semibold text-white hover:bg-amber-900"> Test </Link>
    );
}