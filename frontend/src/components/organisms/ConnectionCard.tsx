import DismissButton from "../atoms/DismissButton";
import PersonalMessageButton from "../atoms/PersonalMessageButton";
import CalculateAge from "../../utils/mini/CalculateAge";
import MinBioBlock from "../molecules/MinBioBlock";
import BlockButton from "../atoms/BlockButton";

interface Props {
    user: {
        connectionId: number;
        id: number;
        nickname: string;
        avatarUrl: string | null;
        country: string;
        dateOfBirth: string;
        }
    onDismiss: () => void;
    onBlock: () => void;
}

export function ConnectionCard({ user, onDismiss, onBlock }: Props){
  const age = user.dateOfBirth ? CalculateAge(user.dateOfBirth) : null;
    return(
            <div className="flex items-center gap-4 bg-amber-500 rounded-xl px-5 py-4">
              <MinBioBlock
                avatarUrl={user.avatarUrl}
                nickname={user.nickname}
                country={user.country}
                age={age}
              />

            <DismissButton onDismiss={onDismiss}/>
            <BlockButton onBlock={onBlock}/>
            </div>
          )
}
