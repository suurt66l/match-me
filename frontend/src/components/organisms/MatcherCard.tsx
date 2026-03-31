import ConnectButton from "../atoms/ConnectButton";
import DismissButton from "../atoms/DismissButton";
import UserCard from "./UserCard";

interface UserData {
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
  onConnect: (id: number) => void;
  onDismiss: (id: number) => void;
}

export default function MatcherCard({ user, onConnect, onDismiss }: Props) {
  return (
    <UserCard user={user}>
      <DismissButton onDismiss={() => onDismiss(user.id)}/>
      <ConnectButton onConnect={() => onConnect(user.id)}/>
    </UserCard>
  );
}
