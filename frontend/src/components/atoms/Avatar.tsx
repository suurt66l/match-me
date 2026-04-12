import { API_URL } from "../../utils/api";
import defaultAvatar from "../../assets/default-avatar.svg";

interface Props {
    avatarUrl: string | null;
    size?: string;
}

export default function Avatar({ avatarUrl, size = "w-14 h-14"}: Props){
    const src = avatarUrl
        ? `${API_URL}${avatarUrl}`
        : defaultAvatar;

    return(
        <div className={`${size} rounded-full bg-amber-950 overflow-hidden shrink-0`}>
            <img
                src={src}
                className="w-full h-full object-cover"
            />
        </div>
    );
}