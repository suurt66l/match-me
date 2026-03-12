import NicknameInput from "../atoms/NicknameInput";
import NicknameLabel from "../atoms/NicknameLabel";
interface Props {
  setNickname: (value: string) => void;
}

export default function NicknameInputBlock({setNickname} : Props) {
    return (
            <div>
              <NicknameLabel />
              <div className="mt-2">
                <NicknameInput 
                  setNickname={setNickname}
                />
              </div>
            </div>
    )
};