import { useState } from "react";
import ProfileInfoNav from "../molecules/ProfileInfoNav";

export default function ProfileSection() {
    const [activeTab, setActiveTab] = useState<"bio" | "preferences">("preferences");
    
    return(
        <ProfileInfoNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        />
    );
}