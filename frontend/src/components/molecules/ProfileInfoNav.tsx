import ProfilePrefButton from "../atoms/ProfilePrefButton";
import ProfileBioButton from "../atoms/ProfileBioButton";
import ProfileAccButton from "../atoms/ProfileAccButton";

interface Props {
    activeTab : "acc" | "bio" | "preferences";
    setActiveTab: (tab: "acc" | "bio" | "preferences") => void;
}

export default function ProfileInfoNav({activeTab, setActiveTab}: Props) {

    return(
        <nav className="flex gap-1">
            <ProfileAccButton 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            />
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