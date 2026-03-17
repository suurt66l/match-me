import { useState } from "react";
import ProfilePictureLabel from "../atoms/ProfilePictureLabel";
import ProfilePictureInput from "../atoms/ProfilePictureInput";

interface Props {
    setProfilePicture: (file: File) => void;
}

export default function ProfilePictureBlock({ setProfilePicture }: Props) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    function handleFileSelect(file: File) {
        setProfilePicture(file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    return (
        <div>
            <ProfilePictureLabel />
            {previewUrl && (
                <div className="mt-3 flex justify-center">
                    <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover outline outline-2 outline-white/25"
                    />
                </div>
            )}
            <div className="mt-2">
                <ProfilePictureInput setProfilePicture={handleFileSelect} />
            </div>
        </div>
    );
}
