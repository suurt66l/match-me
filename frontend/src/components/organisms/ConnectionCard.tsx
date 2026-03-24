import DismissButton from "../atoms/DismissButton";
import PersonalMessageButton from "../atoms/PersonalMessageButton";
import CalculateAge from "../../utils/mini/CalculateAge";
import MinBioBlock from "../molecules/MinBioBlock";

interface Props {
    user: {
        id: number;
        nickname: string;
        avatarUrl: string | null;
        country: string;
        dateOfBirth: string;
        }
    onMessage: () => void;
    onDismiss: () => void;
}

export function ConnectionCard({ user, onMessage, onDismiss }: Props){
  const age = user.dateOfBirth ? CalculateAge(user.dateOfBirth) : null;
    return(
            <div className="flex items-center gap-4 bg-amber-500 rounded-xl px-5 py-4">
              <MinBioBlock
                avatarUrl={user.avatarUrl}
                nickname={user.nickname}
                country={user.country}
                age={age}
              />

            <PersonalMessageButton onMessage={onMessage}/>
            <DismissButton onDismiss={onDismiss}/>
            </div>
          )
}

