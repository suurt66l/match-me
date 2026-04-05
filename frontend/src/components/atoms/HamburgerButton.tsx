interface Props {
    onMenuToggle: () => void;
}

export default function HamburgerButton({ onMenuToggle }: Props) {
    return(
        <div className="lg:hidden">
            <button onClick={onMenuToggle}
                className="flex w-full justify-center rounded-md bg-amber-950 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-amber-900"
                >
                    ☰
            </button>
        </div>
    )
};