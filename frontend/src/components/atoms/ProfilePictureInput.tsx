interface Props {
    setProfilePicture: (file: File) => void;
}

export default function ProfilePictureInput({ setProfilePicture }: Props) {
    return (
        <input
            id="profilePicture"
            name="profilePicture"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-white file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-950 file:text-white hover:file:bg-amber-900 cursor-pointer"
            onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setProfilePicture(file);
            }}
        />
    );
}
