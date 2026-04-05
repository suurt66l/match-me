import { useState } from "react";
import ProfileInfoNav from "../molecules/ProfileInfoNav";
import AccountForm from "./AccountForm";
import BioForm from "./BioForm";
import PreferencesForm from "./PreferencesForm";

export default function ProfileSection() {
    const [activeTab, setActiveTab] = useState<"acc" | "bio" | "preferences">("acc");
    
    return(
    <div>
        <ProfileInfoNav 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        />
        {/* Content below tabs */}
        {activeTab === "acc" && <AccountForm  />}
        {activeTab === "bio" && <BioForm  />}
        {activeTab === "preferences" && <PreferencesForm  />}
    </div>
    );
}