import { API_URL } from "../../utils/api";
import defaultAvatar from "../../assets/default-avatar.svg";

export default function Avatar({avatarUrl} : {avatarUrl: string | null}){
    const src = avatarUrl
        ? `${API_URL}${avatarUrl}`
        : defaultAvatar;

    return(
        <div className="w-14 h-14 rounded-full bg-amber-950 overflow-hidden shrink-0">
            <img
                src={src}
                className="w-full h-full object-cover"
            />
        </div>
    );
}