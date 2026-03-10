import { useNavigate } from "react-router-dom";
import useToken from "../../utils/useToken";

export default function SignOutButton() {
    const { removeToken } = useToken();
    const navigate = useNavigate();
    
    function handleLogout() {
        removeToken();      // clears token from state + localStorage
        window.location.href = '/login'; // redirect to login
    }

    return(
        <div>
            <button
                onClick={handleLogout}
                className="flex w-full justify-center rounded-md bg-amber-950 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-amber-900"
                >
                Sign out
            </button>
        </div>
    )
}