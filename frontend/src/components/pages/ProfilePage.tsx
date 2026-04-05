import ProfileSection from "../organisms/ProfileSection";

export default function ProfilePage() {

    return (
        
        <div className="min-h-screen bg-amber-300 px-6 py-10">
            <h1 className="text-amber-950 text-2xl font-bold mb-6">Profile</h1>
            <ProfileSection />
        </div>
    );
}