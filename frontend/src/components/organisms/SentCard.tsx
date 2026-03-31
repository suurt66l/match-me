import CancelButton from "../atoms/CancelButton";
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
  onCancel: (id: number) => void;
}

export default function SentCard({ user, onCancel }: Props) {
    return(
        <UserCard user={user}>
          <CancelButton onCancel={() => onCancel(user.connectionId)} />
        </UserCard>

    )
}