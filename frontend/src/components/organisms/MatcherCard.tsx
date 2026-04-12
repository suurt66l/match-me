import { useNavigate } from "react-router-dom";
import ConnectButton from "../atoms/ConnectButton";
import DismissButton from "../atoms/DismissButton";
import ViewProfileButton from "../atoms/ViewProfileButton";
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
  const navigate = useNavigate();

  return (
    <UserCard user={user} matchedOnly={true}>
      <ViewProfileButton onClick={() => navigate(`/user/${user.id}`)} />
      <ConnectButton onConnect={() => onConnect(user.id)}/>
      <DismissButton onDismiss={() => onDismiss(user.id)}/>
    </UserCard>
  );
}
