import { useState } from "react";
import ProfileInfoNav from "../molecules/ProfileInfoNav";

export default function ProfileSection() {
    const [activeTab, setActiveTab] = useState<"bio" | "preferences">("preferences");
    
    return(
    <div>
        <ProfileInfoNav 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        />
        {/* Content below tabs */}
        {activeTab === "bio" ? <div>Bio Form</div> : <div>Preferences Form</div>}
    </div>
    );
}