interface Props {
    activeTab : "acc" | "bio" | "preferences";
    setActiveTab: (tab: "acc" | "bio" | "preferences") => void;
}

export default function ProfileAccButton({activeTab, setActiveTab}: Props) {
    return(
        <div>
            <button
                onClick={() => setActiveTab("acc")}
                className={`flex w-full justify-center rounded-md ${activeTab === "acc" ? "bg-amber-800" : "bg-amber-950"} px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-amber-900`}
                >
                Acc
            </button>
        </div>
    )
};