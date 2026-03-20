import DismissButton from "../atoms/DismissButton";
import PersonalMessageButton from "../atoms/PersonalMessageButton";

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
    return(
            <div className="flex items-center gap-4 bg-amber-500 rounded-xl px-5 py-4">
              <div className="w-12 h-12 rounded-full bg-amber-950 overflow-hidden shrink-0">
                <img
                  src={user.avatarUrl ?? "/assets/default-avatar.svg"}
                  alt={user.nickname}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="text-amber-950 font-bold">{user.nickname}</p>
                <p className="text-amber-800 text-sm">
                  {user.country}{user.dateOfBirth ? `, ${calcAge(user.dateOfBirth)}` : ""}
                </p>
              </div>

            <PersonalMessageButton onMessage={onMessage}/>
            <DismissButton onDismiss={onDismiss}/>
            </div>
          )
}

/* Calculates age of the person user is connected to */
function calcAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);

  let age = today.getFullYear() - birth.getFullYear();

  const hasHadBirthday = (today.getMonth() > birth.getMonth()) ||
                         (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthday) {
    age--
  };

  return age;
}