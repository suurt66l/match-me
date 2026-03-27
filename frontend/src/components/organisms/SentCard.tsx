import MinBioBlock from "../molecules/MinBioBlock";
import CalculateAge from "../../utils/mini/CalculateAge";
import CancelButton from "../atoms/CancelButton";

interface Props {
    user: {
        connectionId: number;
        nickname: string;
        avatarUrl: string | null;
        country: string;
        dateOfBirth: string;
    }
    onCancel: () => void;
}

export default function SentCard({ user, onCancel }: Props) {
  const age = CalculateAge(user.dateOfBirth);
    return(
        <div className="flex items-center gap-4 bg-amber-400 rounded-xl px-5 py-4">
          <MinBioBlock
            avatarUrl={user.avatarUrl}
            nickname={user.nickname}
            country={user.country}
            age={age}
          />
          <CancelButton onCancel={onCancel} />
        </div>
    )
}