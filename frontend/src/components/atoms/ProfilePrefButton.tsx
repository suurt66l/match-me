interface Props {
    activeTab : "bio" | "preferences";
    setActiveTab: (tab: "bio" | "preferences") => void;
}

export default function ProfilePrefButton({activeTab, setActiveTab}: Props) {
    return(
        <div>
            <button
                onClick={() => setActiveTab("preferences")}
                className={`flex w-full justify-center rounded-md ${activeTab === "preferences" ? "bg-amber-800" : "bg-amber-950"} px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-amber-900`}
                >
                Preferences
            </button>
        </div>
    )
};