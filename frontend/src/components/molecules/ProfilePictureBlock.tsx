import { useState } from "react";
import ProfilePictureLabel from "../atoms/ProfilePictureLabel";
import ProfilePictureInput from "../atoms/ProfilePictureInput";
import defaultAvatar from "../../assets/default-avatar.svg";

interface Props {
    setProfilePicture: (file: File) => void;
    existingAvatarUrl: string | null;
    onRemove: () => void;
}

export default function ProfilePictureBlock({ setProfilePicture, existingAvatarUrl, onRemove }: Props) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    function handleFileSelect(file: File) {
        setProfilePicture(file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    // Show newly selected file preview, saved avatar, or default
    const displayUrl = previewUrl ?? existingAvatarUrl ?? defaultAvatar;
    const hasPicture = previewUrl !== null || existingAvatarUrl !== null;

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
            <div className="mt-2 space-y-2">
                <ProfilePictureInput setProfilePicture={handleFileSelect} />
                {hasPicture && (
                    <button
                        type="button"
                        onClick={() => { setPreviewUrl(null); onRemove(); }}
                        className="inline-block text-sm text-white py-1.5 px-3 rounded-md border-0 font-semibold bg-amber-950 hover:bg-amber-900 cursor-pointer"
                    >
                        Remove picture
                    </button>
                )}
            </div>
        </div>
    );
}