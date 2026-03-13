interface Props {
    activeTab : "bio" | "preferences";
    setActiveTab: (tab: "bio" | "preferences") => void;
}

export default function ProfileBioButton({activeTab, setActiveTab}: Props) {
    return(
        <div>
            <button
                onClick={() => setActiveTab("bio")}
                className={`flex w-full justify-center rounded-md ${activeTab === "bio" ? "bg-amber-800" : "bg-amber-950"} px-3 py-1.5 my-1 text-sm/6 font-semibold text-white hover:bg-amber-900`}
                >
                Bio
            </button>
        </div>
    )
};