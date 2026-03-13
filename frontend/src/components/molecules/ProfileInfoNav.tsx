import ProfilePrefButton from "../atoms/ProfilePrefButton";
import ProfileBioButton from "../atoms/ProfileBioButton";

interface Props {
    activeTab : "bio" | "preferences";
    setActiveTab: (tab: "bio" | "preferences") => void;
}

export default function ProfileInfoNav({activeTab, setActiveTab}: Props) {

    return(
        <nav>
            <ProfileBioButton 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            />
            <ProfilePrefButton 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            />
            {activeTab === "bio" ? <div>Bio Form here</div> : <div>Preferences Form here</div>}
        </nav>
    );
}