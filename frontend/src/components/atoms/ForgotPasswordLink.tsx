import { Link } from "react-router-dom";

export default function ForgotPasswordLink() {
    return(
        <Link to="/registration" className="font-semibold text-amber-800 hover:text-amber-700"> Forgot password? </Link>
    );
}