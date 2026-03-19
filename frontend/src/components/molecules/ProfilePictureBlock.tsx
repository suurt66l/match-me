import { useState } from "react";
import ProfilePictureLabel from "../atoms/ProfilePictureLabel";
import ProfilePictureInput from "../atoms/ProfilePictureInput";

interface Props {
    setProfilePicture: (file: File) => void;
    existingAvatarUrl: string | null;
}

export default function ProfilePictureBlock({ setProfilePicture, existingAvatarUrl }: Props) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    function handleFileSelect(file: File) {
        setProfilePicture(file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    // Show newly selected file preview, saved avatar, or default
    const displayUrl = previewUrl ?? existingAvatarUrl ?? "/assets/default-avatar.svg";

    return (
        <div>
            <ProfilePictureLabel />
            <div className="mt-3 flex justify-center">
                <img
                    src={displayUrl}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover outline-2 outline-white/25"
                />
            </div>
            <div className="mt-2">
                <ProfilePictureInput setProfilePicture={handleFileSelect} />
            </div>
        </div>
    );
}
