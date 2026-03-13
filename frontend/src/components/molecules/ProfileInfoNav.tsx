import ProfilePrefButton from "../atoms/ProfilePrefButton";
import ProfileBioButton from "../atoms/ProfileBioButton";

interface Props {
    activeTab : "bio" | "preferences";
    setActiveTab: (tab: "bio" | "preferences") => void;
}

export default function ProfileInfoNav({activeTab, setActiveTab}: Props) {

    return(
        <nav className="flex gap-1">
            <ProfileBioButton 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            />
            <ProfilePrefButton 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            />
        </nav>
    );
}