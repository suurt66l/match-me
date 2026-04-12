import { useNavigate } from "react-router-dom";
import DismissButton from "../atoms/DismissButton";
import BlockButton from "../atoms/BlockButton";
import ViewProfileButton from "../atoms/ViewProfileButton";
import MinBioBlock from "../molecules/MinBioBlock";
import CalculateAge from "../../utils/mini/CalculateAge";

interface UserData {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  country: string;
  city?: string;
  dateOfBirth: string;
  gender?: string;
}

interface Props {
  user: UserData;
  onDismiss: (id: number) => void;
  onBlock: (id: number) => void;
}

export default function ConnectionCard({ user, onDismiss, onBlock }: Props) {
  const navigate = useNavigate();
  const age = user.dateOfBirth ? CalculateAge(user.dateOfBirth) : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-amber-500 rounded-xl px-4 py-3 gap-3">
      <MinBioBlock
        avatarUrl={user.avatarUrl}
        nickname={user.nickname}
        country={user.country}
        city={user.city}
        age={age}
        gender={user.gender}
      />
      <div className="flex gap-2 sm:shrink-0">
        <ViewProfileButton onClick={() => navigate(`/user/${user.id}`)} />
        <DismissButton onDismiss={() => onDismiss(user.id)} />
        <BlockButton onBlock={() => onBlock(user.id)} />
      </div>
    </div>
  );
}
