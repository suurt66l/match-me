import AcceptButton from "../atoms/AcceptButton";
import DismissButton from "../atoms/DismissButton";
import CalculateAge from "../../utils/mini/CalculateAge";
import MinBioBlock from "../molecules/MinBioBlock";

interface Props {
    user: {
        connectionId: number;
        nickname: string;
        avatarUrl: string | null;
        country: string;
        dateOfBirth: string;
    }
    onAccept: () => void;
    onDismiss: () => void;
}

export default function PendingCard({ user, onAccept, onDismiss }: Props) {
  const age = CalculateAge(user.dateOfBirth);
    return(
        <div className="flex items-center gap-4 bg-amber-500 rounded-xl px-5 py-4">
          <MinBioBlock
            avatarUrl={user.avatarUrl}
            nickname={user.nickname}
            country={user.country}
            age={age}
          />
          <AcceptButton onAccept={onAccept} />
          <DismissButton onDismiss={onDismiss} />
        </div>
    )
}
