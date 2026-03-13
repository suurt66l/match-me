import ProfileSection from "../organisms/ProfileSection";

export default function ProfilePage() {

    return (
        <div>
            { /* Main Zone */}
            <div className="flex justify-center min-h-screen bg-amber-300">
                <ProfileSection />
            </div>
        </div>
    );
}