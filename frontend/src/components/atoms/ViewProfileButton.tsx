interface Props {
  onClick: () => void;
}

export default function ViewProfileButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm font-semibold bg-amber-700 text-white hover:bg-amber-600"
    >
      View Profile
    </button>
  );
}
