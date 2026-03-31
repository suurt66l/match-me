import AcceptButton from "../atoms/AcceptButton";
import DismissButton from "../atoms/DismissButton";
import UserCard from "./UserCard";

interface UserData {
  connectionId: number;
  id: number;
  nickname: string;
  avatarUrl: string | null;
  country: string;
  dateOfBirth: string;
  games: string;
  gameGenres: string;
  platform: string;
  lookingFor: string;
  intensity: string;
  timeRange: string;
  aboutMe: string;
  matchedFields: string[];
}

interface Props {
  user: UserData;
  onAccept: (id: number) => void;
  onDismiss: (id: number) => void;
}

export default function PendingCard({ user, onAccept, onDismiss }: Props) {
    return(
        <UserCard user={user}>
          <AcceptButton onAccept={() => onAccept(user.id)} />
          <DismissButton onDismiss={() => onDismiss(user.connectionId)} />
        </UserCard>

    )
}
