import { useNavigate } from "react-router-dom";
import AcceptButton from "../atoms/AcceptButton";
import DismissButton from "../atoms/DismissButton";
import MinBioBlock from "../molecules/MinBioBlock";
import CalculateAge from "../../utils/mini/CalculateAge";

interface UserData {
  connectionId: number;
  id: number;
  nickname: string;
  avatarUrl: string | null;
  country: string;
  dateOfBirth: string;
  gender?: string;
}

interface Props {
  user: UserData;
  onAccept: (id: number) => void;
  onDismiss: (id: number) => void;
}

export default function PendingCard({ user, onAccept, onDismiss }: Props) {
  const navigate = useNavigate();
  const age = user.dateOfBirth ? CalculateAge(user.dateOfBirth) : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-amber-500 rounded-xl px-4 py-3 gap-3">
      <MinBioBlock
        avatarUrl={user.avatarUrl}
        nickname={user.nickname}
        country={user.country}
        age={age}
        gender={user.gender}
      />
      <div className="flex gap-2 sm:shrink-0">
        <button
          onClick={() => navigate(`/user/${user.id}`)}
          className="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm font-semibold bg-amber-700 text-white hover:bg-amber-600"
        >
          Profile
        </button>
        <AcceptButton onAccept={() => onAccept(user.connectionId)} />
        <DismissButton onDismiss={() => onDismiss(user.connectionId)} />
      </div>
    </div>
  );
}
